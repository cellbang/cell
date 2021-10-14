import { Component } from '@malagu/core';
import { ClientOptions, Credentials, CreateBucketResult, Body, CreateBucketRequest, DeleteBucketRequest, DeleteObjectRequest, GetObjectRequest, CopyObjectRequest,
    HeadObjectResult, ListAllMyBucketsResult, ListObjectsRequest, ListObjectsResult, ObjectStorageService,
    PutObjectRequest, AbstractObjectStorageService, Account } from '@malagu/cloud';
import { Readable } from 'stream';
import { promisify } from 'util';
const COS = require('cos-nodejs-sdk-v5');

@Component(ObjectStorageService)
export class ObjectStorageServiceImpl extends AbstractObjectStorageService<any> {

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

        const { Location } = await promisify(service.putBucket.bind(service))({ Bucket: bucket, Region: this.region });
        return { location: Location };
    }

    async deleteBucket(request: DeleteBucketRequest): Promise<void> {
        const service = await this.getRawCloudService();
        const { bucket } = request;
        await promisify(service.deleteBucket.bind(service))({ Bucket: bucket, Region: this.region });
    }

    async listBuckets(): Promise<ListAllMyBucketsResult> {
        const service = await this.getRawCloudService();
        const { Buckets, Owner } = await promisify(service.getService().bind(service))({ Region: this.region });
        const buckets = Buckets?.map((bucket: any) => ({ name: bucket.Name!, creationDate: bucket.CreationDate! })) || [];
        const owner = Owner ? { id: Owner.ID, displayName: Owner.DisplayName } : undefined;
        return { buckets, owner};
    }

    async listObjects(request: ListObjectsRequest): Promise<ListObjectsResult> {
        const service = await this.getRawCloudService();
        const { bucket, prefix, maxKeys, delimiter, continuationToken, encodingType } = request;
        const result = await promisify(service.getBucket.bind(service))({
            Bucket: bucket,
            Region: this.region,
            Marker: continuationToken,
            Prefix: prefix,
            Delimiter: delimiter,
            EncodingType: encodingType,
            MaxKeys: (maxKeys || 1000) + ''
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
            nextContinuationToken: result.Marker,
            keyCount: contents.length,
            maxKeys: parseInt(result.MaxKeys),
            delimiter: result.Delimiter,
            name: result.Name,
            encodingType,
            prefix: result.Prefix
        };
    }

    async getObject(request: GetObjectRequest): Promise<Body> {
        const service = await this.getRawCloudService();
        const { bucket, key } = request;
        const result = await promisify(service.getObject.bind(service))({ Bucket: bucket, Key: key, Region: this.region});
        return result.Body;
    }

    async getStream(request: GetObjectRequest): Promise<Readable> {
        const service = await this.getRawCloudService();
        const { bucket, key } = request;
        const result = await promisify(service.getObject.bind(service))({ Bucket: bucket, Key: key, Region: this.region, ReturnStream: true });
        return result.Body;
    }

    async putObject(request: PutObjectRequest): Promise<void> {
        const service = await this.getRawCloudService();
        const { bucket, key, body, cacheControl, contentDisposition, contentLength, contentType, expires, contentEncoding } = request;
        await promisify(service.putObject.bind(service))({ Bucket: bucket, Key: key, Body: body, CacheControl: cacheControl, ContentDisposition: contentDisposition,
            ContentEncoding: contentEncoding, ContentLength: contentLength, ContentType: contentType, Expires: expires, Region: this.region });
    }

    async copyObject(request: CopyObjectRequest): Promise<void> {
        const service = await this.getRawCloudService();
        const { bucket, key, copySource } = request;
        await promisify(service.putObjectCopy.bind(service))({ Bucket: bucket, Key: key, CopySource: copySource, Region: this.region });
    }

    async deleteObject(request: DeleteObjectRequest): Promise<void> {
        const service = await this.getRawCloudService();
        const { bucket, key } = request;
        await promisify(service.deleteObject.bind(service))({ Bucket: bucket, Key: key, Region: this.region });
    }

    async headObject(request: GetObjectRequest): Promise<HeadObjectResult> {
        const service = await this.getRawCloudService();
        const { bucket, key } = request;
        const { headers } = await promisify(service.headObject.bind(service))({ Bucket: bucket, Key: key, Region: this.region });
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
