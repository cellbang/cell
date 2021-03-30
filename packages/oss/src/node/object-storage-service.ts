import { Component } from '@malagu/core';
import { ClientOptions, Credentials, Body, CreateBucketResult, CreateBucketRequest, DeleteBucketRequest, DeleteObjectRequest, GetObjectRequest, CopyObjectRequest,
    HeadObjectResult, ListAllMyBucketsResult, ListObjectsRequest, ListObjectsResult, ObjectStorageService, PutObjectRequest, AbstractObjectStorageService } from '@malagu/cloud';
import * as OSS from 'ali-oss';
import { Readable } from 'stream';

@Component(ObjectStorageService)
export class ObjectStorageServiceImpl extends AbstractObjectStorageService<OSS> {

    protected async doCreateRawCloudService(credentials: Credentials, region: string, clientOptions: ClientOptions, account?: Account): Promise<OSS> {
        return new OSS({
            ...clientOptions,
            accessKeyId: credentials.accessKeyId,
            accessKeySecret: credentials.accessKeySecret,
            stsToken: credentials.token,
            region: `oss-${region}`,
        });
    }

    async createBucket(request: CreateBucketRequest): Promise<CreateBucketResult> {
        const service = await this.getRawCloudService();
        const { bucket } = request;
        await service.putBucket(bucket);
        return {};
    }

    async deleteBucket(request: DeleteBucketRequest): Promise<void> {
        const service = await this.getRawCloudService();
        const { bucket } = request;
        await service.delete(bucket);
    }

    async listBuckets(): Promise<ListAllMyBucketsResult> {
        const service = await this.getRawCloudService();
        // eslint-disable-next-line no-null/no-null
        const buckets = await service.listBuckets(null);
        return { buckets: buckets.map(bucket => ({ name: bucket.name, creationDate: new Date(bucket.creationDate) })) };
    }

    async listObjects(request: ListObjectsRequest): Promise<ListObjectsResult> {
        const service = await this.getRawCloudService();
        const { bucket, prefix, maxKeys, delimiter, continuationToken } = request;
        service.useBucket(bucket);
        const { objects, prefixes, nextMarker, isTruncated } = await service.list({ prefix, delimiter, 'max-keys': maxKeys || 1000, marker: continuationToken }, {});
        const contents = objects || [];
        return {
            contents: contents.map(obj => ({ key: obj.name, etag: obj.etag, lastModified: obj.lastModified ? new Date(obj.lastModified) : undefined,
                size: obj.size, storageClass: obj.storageClass })),
            commonPrefixes: prefixes?.map(p => ({ prefix: p })),
            isTruncated,
            continuationToken,
            nextContinuationToken: nextMarker,
            keyCount: contents.length,
            maxKeys, delimiter,
            name: bucket
        };
    }

    async getObject(request: GetObjectRequest): Promise<Body> {
        const service = await this.getRawCloudService();
        const { bucket, key, range } = request;
        service.useBucket(bucket);
        const { content } = await service.get(key, undefined, { headers: { Range: range } });
        return content;
    }

    async getStream(request: GetObjectRequest): Promise<Readable> {
        const service = await this.getRawCloudService();
        const { bucket, key, range } = request;
        service.useBucket(bucket);
        const { stream } = await service.getStream(key, { headers: { Range: range } });
        return stream;
    }

    async putObject(request: PutObjectRequest): Promise<void> {
        const service = await this.getRawCloudService();
        const { bucket, key, body, expires, contentLength, contentEncoding, contentDisposition, contentType } = request;
        service.useBucket(bucket);
        await service.put(key, body instanceof Uint8Array ? Buffer.from(body) : body, {
            contentLength,
            headers: {
                Expires: expires?.toUTCString(),
                'Content-Encoding': contentEncoding,
                'Content-Disposition': contentDisposition,
                'Content-Type': contentType
            }
        } as any);
    }

    async copyObject(request: CopyObjectRequest): Promise<void> {
        const service = await this.getRawCloudService();
        const { bucket, key, copySource } = request;
        service.useBucket(bucket);
        await service.copy(key, copySource);
    }

    async deleteObject(request: DeleteObjectRequest): Promise<void> {
        const service = await this.getRawCloudService();
        const { bucket, key } = request;
        service.useBucket(bucket);
        await service.delete(key);
    }

    async headObject(request: GetObjectRequest): Promise<HeadObjectResult> {
        const service = await this.getRawCloudService();
        const { bucket, key } = request;
        service.useBucket(bucket);
        const { res } = await service.head(key);
        const headers = res.headers as any;
        return {
            contentLength: parseInt(headers['content-length']),
            contentType: headers['content-type'],
            contentDisposition: headers['content-disposition'],
            cacheControl: headers['cache-control'],
            expires: headers['expires'],
            contentEncoding: headers['content-encoding'],
        };
    }
}
