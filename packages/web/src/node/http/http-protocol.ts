import { Request as RawRequest, Response as RawResponse } from 'express';
import { CORS_MIDDLEWARE_PRIORITY } from '../cors';

export const HTTP_MIDDLEWARE_PRIORITY = CORS_MIDDLEWARE_PRIORITY - 100;

export interface Request extends RawRequest {
}

export interface Response extends RawResponse {
    body?: any;
}
