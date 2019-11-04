import * as http from 'http';
import * as net from 'net';

export const HTTP_MIDDLEWARE_PRIORITY =  2000;

export const XML_HTTP_REQUEST = 'XMLHttpRequest';
export const X_REQUESTED_WITH = 'X-Requested-With';

export interface Request {
    method: string;
    headers: http.IncomingHttpHeaders;
    body: any;
    url: string;
    path: string;
    query: { [key: string]: string };
    connection: net.Socket;
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
