import {  Context, Request, Response } from '@malagu/core/lib/node';
import * as http from 'http';

export type Callback = (err: Error | undefined, data: any) => void;

export abstract class AbstractContext implements Context {
    request: Request;
    response: Response;
}

export class ApiGatewayContext extends AbstractContext {

    _response: { [key: string]: any } = {
        headers: {},
        isBase64Encoded: false
    };

    constructor(public event: string, public context: any, public callback: Callback) {
        super();
        const e = JSON.parse(event);
        this.request = {
            method: e.method,
            path: e.path,
            url: e.path,
            query: e.queryParameters || {},
            headers: e.headers,
            get body() {
                const body = e.isBase64Encoded ? Buffer.from(e.body, 'base64').toString('utf8') : e.body;
                if (e.headers['content-type'] === 'application/json') {
                    return JSON.parse(body);
                }
            }

        };
        const res = this._response;
        this.response = {
            setHeader(name: string, value: number | string | string[]): void {
                res.headers[name] = value;
            },

            getHeader(name: string): number | string | string[] | undefined {
                return this.getHeaders()[name];
            },

            getHeaders(): http.OutgoingHttpHeaders {
                return res.headers;
            },

            get statusCode(): number {
                return res.statusCode;
            },

            finished: false,

            set statusCode(statusCode: number) {
                res.statusCode = statusCode;
            },

            end: (chunk: any, encoding?: string, cb?: Function): void => {
                this.callback(undefined, {
                    ...res,
                    body: chunk
                });
            }

        };

    }

    async handleError(err: Error): Promise<void> {
        this.callback(err, undefined);
    }

    async handleMessage(message: string): Promise<void> {
        this.callback(undefined, {
            isBase64Encoded: false,
            statusCode: 200,
            body: message
        });
    }
}

export class HttpTriggerContext extends AbstractContext {

    constructor(req: any, res: any, public context: any) {
        super();
        this.request = req;
        if (req.headers['content-type'] === 'application/json') {
            this.request.body = JSON.parse(this.request.body);
        }
        this.response = {
            setHeader(name: string, value: number | string | string[]): void {
                res.setHeader(name, value);
            },

            getHeader(name: string): number | string | string[] | undefined {
                return res.getHeader ? res.getHeader(name) : this.getHeaders()[name];
            },

            getHeaders(): http.OutgoingHttpHeaders {
                return res.headers || res.getHeaders();
            },

            get statusCode(): number {
                return res.statusCode;
            },

            set statusCode(statusCode: number) {
                res.statusCode = statusCode;
            },

            finished: false,

            end(chunk: any, encoding?: string, cb?: Function): void {
                this.finished = true;
                res.send(chunk);
            }
        };
    }
}
