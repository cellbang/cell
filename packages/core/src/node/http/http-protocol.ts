import * as http from 'http';
import { CHANNEL_MIDDLEWARE_PRIORITY } from '../channel';

export const HTTP_MIDDLEWARE_PRIORITY = CHANNEL_MIDDLEWARE_PRIORITY - 100;

export interface Request {
    method: string;
    headers: http.IncomingHttpHeaders;
    body: any;
    url: string;
    path: string;
    query: { [key: string]: string };
}

export interface Response {
    statusCode: number;
    setHeader(name: string, value: number | string | string[]): void;
    getHeader(name: string): number | string | string[] | undefined;
    getHeaders(): http.OutgoingHttpHeaders;
    end(chunk: any, encoding?: string, cb?: Function): void;
    finished: boolean;
    body?: any;
}
