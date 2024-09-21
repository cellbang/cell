import { Component } from '@celljs/core';
import { ClientOptions, Credentials, Body, CreateBucketResult, CreateBucketRequest, DeleteBucketRequest, DeleteObjectRequest, GetObjectRequest, CopyObjectRequest,
    HeadObjectResult, ListAllMyBucketsResult, ListObjectsRequest, ListObjectsResult, ObjectStorageService,
    PutObjectRequest, AbstractObjectStorageService, Account } from '@celljs/cloud';
import { S3 } from 'aws-sdk';
import { Readable } from 'stream';

@Component(ObjectStorageService)
export class ObjectStorageServiceImpl extends AbstractObjectStorageService<S3> {

    protected async doCreateRawCloudService(credentials: Credentials, region: string, clientOptions: ClientOptions, account?: Account): Promise<S3> {
        return new S3({
            apiVersion: clientOptions.apiVersion,
            region,
            credentials: {
                accessKeyId: credentials.accessKeyId,
                secretAccessKey: credentials.accessKeySecret,
                sessionToken: credentials.token
            }
        });
    }

    async createBucket(request: CreateBucketRequest): Promise<CreateBucketResult> {
        const service = await this.getRawCloudService();
        const { bucket } = request;
        const a = await service.createBucket({ Bucket: bucket }).promise();
        return { location: a.Location };
    }

    async deleteBucket(request: DeleteBucketRequest): Promise<void> {
        const service = await this.getRawCloudService();
        const { bucket, expectedBucketOwner } = request;
        await service.deleteBucket({ Bucket: bucket, ExpectedBucketOwner: expectedBucketOwner }).promise();
    }

    async listBuckets(): Promise<ListAllMyBucketsResult> {
        const service = await this.getRawCloudService();
        const { Buckets, Owner } = await service.listBuckets().promise();
        const buckets = Buckets?.map(bucket => ({ name: bucket.Name!, creationDate: bucket.CreationDate! })) || [];
        const owner = Owner ? { id: Owner.ID, displayName: Owner.DisplayName } : undefined;
        return { buckets, owner};
    }

    async listObjects(request: ListObjectsRequest): Promise<ListObjectsResult> {
        const service = await this.getRawCloudService();
        const { bucket, prefix, maxKeys, delimiter, continuationToken } = request;
        const result = await service.listObjectsV2({
            Bucket: bucket,
            Prefix: prefix,
            Delimiter: delimiter,
            MaxKeys: maxKeys || 1000,
            ContinuationToken: continuationToken
        }).promise();
        const contents = result.Contents?.map(obj => ({
            key: obj.Key!,
            etag: obj.ETag,
            lastModified: obj.LastModified,
            owner: obj.Owner ? { id: obj.Owner.ID, displayName: obj.Owner.DisplayName } : undefined,
            size: obj.Size!,
            storageClass: obj.StorageClass!
        })) || [];
        const commonPrefixes = result.CommonPrefixes?.map(item => ({ prefix: item.Prefix!}));
        return {
            contents,
            commonPrefixes: commonPrefixes,
            isTruncated: result.IsTruncated!,
            continuationToken: result.ContinuationToken,
            nextContinuationToken: result.NextContinuationToken,
            keyCount: result.KeyCount!,
            maxKeys: result.MaxKeys!,
            delimiter: result.Delimiter,
            name: result.Name!,
            encodingType: result.EncodingType,
            prefix: result.Prefix,
            startAfter: result.StartAfter
        };
    }

    async getObject(request: GetObjectRequest): Promise<Body> {
        const service = await this.getRawCloudService();
        const { bucket, key, range } = request;
        const result = await service.getObject({ Bucket: bucket, Key: key, Range: range}).promise();
        return <Body>result.Body;
    }

    async getStream(request: GetObjectRequest): Promise<Readable> {
        const service = await this.getRawCloudService();
        const { bucket, key, range } = request;
        return service.getObject({ Bucket: bucket, Key: key, Range: range }).createReadStream();
    }

    async putObject(request: PutObjectRequest): Promise<void> {
        const service = await this.getRawCloudService();
        const { bucket, key, body, cacheControl, contentDisposition, contentLength, contentType, expires, contentEncoding } = request;
        await service.putObject({ Bucket: bucket, Key: key, Body: body, CacheControl: cacheControl, ContentDisposition: contentDisposition,
            ContentEncoding: contentEncoding, ContentLength: contentLength, ContentType: contentType, Expires: expires }).promise();
    }

    async copyObject(request: CopyObjectRequest): Promise<void> {
        const service = await this.getRawCloudService();
        const { bucket, key, copySource } = request;
        await service.copyObject({ Bucket: bucket, Key: key, CopySource: copySource }).promise();
    }

    async deleteObject(request: DeleteObjectRequest): Promise<void> {
        const service = await this.getRawCloudService();
        const { bucket, key } = request;
        await service.deleteObject({ Bucket: bucket, Key: key }).promise();
    }

    async headObject(request: GetObjectRequest): Promise<HeadObjectResult> {
        const service = await this.getRawCloudService();
        const { bucket, key } = request;
        const { CacheControl, ContentDisposition, ContentEncoding, ContentLength, ContentType, Expires } = await service.headObject({ Bucket: bucket, Key: key }).promise();
        return {
            cacheControl: CacheControl,
            contentDisposition: ContentDisposition,
            contentEncoding: ContentEncoding,
            contentLength: ContentLength,
            contentType: ContentType,
            expires: Expires
        };
    }
}
