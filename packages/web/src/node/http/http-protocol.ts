import { Request as RawRequest, Response as RawResponse } from 'express';
import { CORS_MIDDLEWARE_PRIORITY } from '../cors';
import * as http from 'http';

export const ServerAware = Symbol('ServerAware');
export const HTTP_MIDDLEWARE_PRIORITY = CORS_MIDDLEWARE_PRIORITY - 100;

export interface Request extends RawRequest {
}

export interface Response extends RawResponse {
    body?: any;
}

export interface ServerAware {
    setServer(server: http.Server): Promise<void>;
}
