import { Readable } from 'stream';
import { AbstractCloudService, CloudService } from './cloud-protocol';

export const ObjectStorageService = Symbol('ObjectStorageService');

export const OBJECT_STORAGE_NAME = 'objectStorage';

export type Body = Buffer|Uint8Array|Blob|string|Readable;

export interface Owner {
    id?: string;
    displayName?: string;
}

export interface Bucket {
    name: string;
    creationDate: Date;
}

export interface Object {
    etag?: string;
    key: string;
    lastModified?: Date;
    Owner?: Owner;
    size: number;
    storageClass: string;
}

export interface ListAllMyBucketsResult {
    owner?: Owner;
    buckets: Bucket[];
}

export interface ListObjectsRequest {
    bucket: string;
    continuationToken?: string;
    delimiter?: string;
    encodingType?: string;
    fetchOwner?: string;
    maxKeys: number;
    prefix?: string;
    startAfter?: string;
    requestPayer?: string;
    expectedBucketOwner?: string;
}

export interface ListObjectsResult {
    commonPrefixes?: { prefix: string }[];
    contents: Object[];
    continuationToken?: string;
    delimiter?: string;
    encodingType?: string;
    isTruncated: boolean;
    keyCount: number;
    maxKeys: number;
    name: string;
    nextContinuationToken?: string;
    prefix?: string;
    startAfter?: string;
}

export interface GetObjectRequest {
    bucket: string;
    key: string;
    range?: string;
}

export interface CreateBucketRequest {
    bucket: string;
}

export interface CreateBucketResult {
    location?: string;
}

export interface PutObjectRequest {
    bucket: string;
    key: string;
    body: Body;
    cacheControl?: string;
    contentDisposition?: string;
    contentEncoding?: string;
    contentLength?: number;
    contentType?: string;
    expires?: Date;
}

export interface CopyObjectRequest {
    bucket: string;
    key: string;
    copySource: string;
}

export interface DeleteObjectRequest {
    bucket: string;
    key: string;
    mfa?: string;
    requestPayer?: string;
    bypassGovernanceRetention?: string;
    expectedBucketOwner?: string;
}

export interface DeleteBucketRequest {
    bucket: string;
    expectedBucketOwner?: string;
}

export interface HeadObjectResult {
    cacheControl?: string;
    contentDisposition?: string;
    contentEncoding?: string;
    contentLength?: number;
    contentType?: string;
    expires?: Date;
}

export interface ObjectStorageService<T> extends CloudService<T> {
    createBucket(request: CreateBucketRequest): Promise<CreateBucketResult>;
    deleteBucket(request: DeleteBucketRequest): Promise<void>;
    listBuckets(): Promise<ListAllMyBucketsResult>;
    listObjects(request: ListObjectsRequest): Promise<ListObjectsResult>;
    getObject(request: GetObjectRequest): Promise<Body>;
    getStream(request: GetObjectRequest): Promise<Readable>;
    putObject(request: PutObjectRequest): Promise<void>;
    copyObject(request: CopyObjectRequest): Promise<void>;
    deleteObject(request: DeleteObjectRequest): Promise<void>;
    headObject(request: GetObjectRequest): Promise<HeadObjectResult>;
}

export abstract class AbstractObjectStorageService<T> extends AbstractCloudService<T> implements ObjectStorageService<T> {
    name = OBJECT_STORAGE_NAME;
    abstract createBucket(request: CreateBucketRequest): Promise<CreateBucketResult>;
    abstract deleteBucket(request: DeleteBucketRequest): Promise<void>;
    abstract listBuckets(): Promise<ListAllMyBucketsResult>;
    abstract listObjects(request: ListObjectsRequest): Promise<ListObjectsResult> ;
    abstract getObject(request: GetObjectRequest): Promise<Body>;
    abstract getStream(request: GetObjectRequest): Promise<Readable>;
    abstract putObject(request: PutObjectRequest): Promise<void>;
    abstract copyObject(request: CopyObjectRequest): Promise<void>;
    abstract deleteObject(request: DeleteObjectRequest): Promise<void>;
    abstract headObject(request: GetObjectRequest): Promise<HeadObjectResult>;
}

