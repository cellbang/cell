import { Component } from '@malagu/core';
import { ClientOptions, Credentials, Body, CreateBucketResult, CreateBucketRequest, DeleteBucketRequest, DeleteObjectRequest, GetObjectRequest,
    HeadObjectResult, ListAllMyBucketsResult, ListObjectsRequest, ListObjectsResult, ObjectStorageService, PutObjectRequest, AbstractObjectStorageService } from '@malagu/cloud';
import * as OSS from 'ali-oss';
import { Readable } from 'stream';

const { Wrapper } = OSS as any;

@Component(ObjectStorageService)
export class ObjectStorageServiceImpl extends AbstractObjectStorageService<OSS> {

    protected async doCreateRawCloudService(credentials: Credentials, region: string, clientOptions: ClientOptions, account?: Account): Promise<OSS> {
        return new Wrapper({
            ...clientOptions,
            ...credentials,
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
        return {
            contents: objects.map(obj => ({ key: obj.name, etag: obj.etag, lastModified: obj.lastModified ? new Date(obj.lastModified) : undefined,
                size: obj.size, storageClass: obj.storageClass })),
            commonPrefixes: prefixes?.map(p => ({ prefix: p })),
            isTruncated,
            continuationToken,
            nextContinuationToken: nextMarker,
            keyCount: objects.length,
            maxKeys, delimiter,
            name: bucket
        };
    }

    async getObject(request: GetObjectRequest): Promise<Body> {
        const service = await this.getRawCloudService();
        const { bucket, key } = request;
        service.useBucket(bucket);
        const { content } = await service.get(key);
        return content;
    }

    async getStream(request: GetObjectRequest): Promise<Readable> {
        const service = await this.getRawCloudService();
        const { bucket, key } = request;
        service.useBucket(bucket);
        const { stream } = await service.getStream(key);
        return stream;
    }

    async putObject(request: PutObjectRequest): Promise<void> {
        const service = await this.getRawCloudService();
        const { bucket, key, body } = request;
        service.useBucket(bucket);
        await service.put(key, body);
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
        await service.head(key);
        return {};
    }
}
