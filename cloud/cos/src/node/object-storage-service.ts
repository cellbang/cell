import { Component } from '@malagu/core';
import { ClientOptions, Credentials, CreateBucketResult, Body, CreateBucketRequest, DeleteBucketRequest, DeleteObjectRequest, GetObjectRequest, CopyObjectRequest,
    HeadObjectResult, ListAllMyBucketsResult, ListObjectsRequest, ListObjectsResult, ObjectStorageService,
    PutObjectRequest, AbstractObjectStorageService, Account } from '@malagu/cloud';
import { Stream } from 'stream';
import * as COS from 'cos-nodejs-sdk-v5';

@Component(ObjectStorageService)
export class ObjectStorageServiceImpl extends AbstractObjectStorageService<COS> {

    protected region: string;

    protected async doCreateRawCloudService(credentials: Credentials, region: string, clientOptions: ClientOptions, account?: Account): Promise<any> {
        this.region = region;
        return new COS({
            SecretId: credentials.accessKeyId,
            SecretKey: credentials.accessKeySecret,
            XCosSecurityToken: credentials.token,
            Timeout: clientOptions.timeout
        });
    }

    async createBucket(request: CreateBucketRequest): Promise<CreateBucketResult> {
        const service = await this.getRawCloudService();
        const { bucket } = request;

        const { Location } = await service.putBucket({ Bucket: bucket, Region: this.region });
        return { location: Location };
    }

    async deleteBucket(request: DeleteBucketRequest): Promise<void> {
        const service = await this.getRawCloudService();
        const { bucket } = request;
        await service.deleteBucket({ Bucket: bucket, Region: this.region });
    }

    async listBuckets(): Promise<ListAllMyBucketsResult> {
        const service = await this.getRawCloudService();
        const { Buckets, Owner } = await service.getService({ Region: this.region });
        const buckets = Buckets?.map((bucket: any) => ({ name: bucket.Name!, creationDate: bucket.CreationDate! })) || [];
        const owner = Owner ? { id: Owner.ID } : undefined;
        return { buckets, owner };
    }

    async listObjects(request: ListObjectsRequest): Promise<ListObjectsResult> {
        const service = await this.getRawCloudService();
        const { bucket, prefix, maxKeys, delimiter, continuationToken, encodingType } = request;
        const result = await service.getBucket({
            Bucket: bucket,
            Region: this.region,
            Marker: continuationToken,
            Prefix: prefix,
            Delimiter: delimiter,
            EncodingType: encodingType,
            MaxKeys: maxKeys || 1000
        });
        const contents = result.Contents?.map((obj: any) => ({
            key: obj.Key!,
            etag: obj.ETag,
            lastModified: obj.LastModified,
            owner: obj.Owner ? { id: obj.Owner.ID, displayName: obj.Owner.DisplayName } : undefined,
            size: obj.Size!,
            storageClass: obj.StorageClass!
        })) || [];
        const commonPrefixes = result.CommonPrefixes?.map((item: any) => ({ prefix: item.Prefix}));
        return {
            contents,
            commonPrefixes: commonPrefixes,
            isTruncated: result.IsTruncated === 'false' ? false : true,
            continuationToken: continuationToken,
            nextContinuationToken: result.NextMarker,
            keyCount: contents.length,
            maxKeys: maxKeys,
            delimiter: delimiter,
            name: bucket,
            encodingType,
            prefix: prefix
        };
    }

    async getObject(request: GetObjectRequest): Promise<Body> {
        const service = await this.getRawCloudService();
        const { bucket, key } = request;
        const result = await service.getObject({ Bucket: bucket, Key: key, Region: this.region});
        return result.Body;
    }

    async getStream(request: GetObjectRequest): Promise<Stream> {
        const service = await this.getRawCloudService();
        const { bucket, key } = request;
        return service.getObjectStream({ Bucket: bucket, Key: key, Region: this.region });
    }

    async putObject(request: PutObjectRequest): Promise<void> {
        const service = await this.getRawCloudService();
        const { bucket, key, body, cacheControl, contentDisposition, contentLength, contentType, expires, contentEncoding } = request;
        await service.putObject({ Bucket: bucket, Key: key, Body: body, CacheControl: cacheControl, ContentDisposition: contentDisposition,
            ContentEncoding: contentEncoding, ContentLength: contentLength, ContentType: contentType, Expires: expires?.toUTCString(), Region: this.region });
    }

    async copyObject(request: CopyObjectRequest): Promise<void> {
        const service = await this.getRawCloudService();
        const { bucket, key, copySource } = request;
        await service.putObjectCopy({ Bucket: bucket, Key: key, CopySource: copySource, Region: this.region });
    }

    async deleteObject(request: DeleteObjectRequest): Promise<void> {
        const service = await this.getRawCloudService();
        const { bucket, key } = request;
        await service.deleteObject({ Bucket: bucket, Key: key, Region: this.region });
    }

    async headObject(request: GetObjectRequest): Promise<HeadObjectResult> {
        const service = await this.getRawCloudService();
        const { bucket, key } = request;
        const { headers } = await service.headObject({ Bucket: bucket, Key: key, Region: this.region });
        return {
            contentLength: headers && headers['content-length'] ? parseInt(headers['content-length']) : undefined,
            contentType: headers && headers['content-type'] ,
            contentDisposition: headers && headers['content-disposition'],
            cacheControl: headers && headers['cache-control'],
            expires: headers && headers['expires'],
            contentEncoding: headers && headers['content-encoding'],
        };
    }
}
