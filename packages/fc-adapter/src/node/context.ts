import {  Context, Request, Response } from '@malagu/core/lib/node';
import { HttpChannel } from '@malagu/core/lib/common/jsonrpc/http-channel';
import { Channel } from '@malagu/core/lib/common/jsonrpc/channel-protocol';
import * as http from 'http';

export type Callback = (err: Error | undefined, data: any) => void;

export abstract class AbstractContext implements Context {
    request: Request;
    response: Response;

    protected message: Channel.Message;

    constructor(public context: any) {
    }

    async getMessage(): Promise<Channel.Message> {
        if (!this.message) {
            this.message = this.request.body;
        }
        return this.message;
    }

    abstract handleError(err: Error): Promise<void>;

    abstract handleMessage(message: string): Promise<void>;

    async createChannel(id: number): Promise<Channel> {
        return new HttpChannel(id, async content => {
            this.handleMessage(content);
        });
    }

    async handleChannels(channelFactory: () => Promise<Channel>): Promise<void> {
        const channel = await channelFactory();
        channel.handleMessage(this.message);
    }

}

export class ApiGatewayContext extends AbstractContext {

    _response: { [key: string]: any } = {
        headers: {},
        isBase64Encoded: false
    };

    constructor(public event: string, public context: any, public callback: Callback) {
        super(context);
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

export class HttpContext extends AbstractContext {

    constructor(public _request: any, public _response: any, public context: Context) {
        super(context);
        this.request = _request;
        if (_request.headers['content-type'] === 'application/json') {
            this.request.body = JSON.parse(this.request.body);
        }
        this.response = {
            setHeader(name: string, value: number | string | string[]): void {
                _response.setHeader(name, value);
            },

            getHeader(name: string): number | string | string[] | undefined {
                return this.getHeaders()[name];
            },

            getHeaders(): http.OutgoingHttpHeaders {
                return _response.headers || _response.getHeaders();
            },

            get statusCode(): number {
                return _response.statusCode;
            },

            set statusCode(statusCode: number) {
                _response.statusCode = statusCode;
            },

            end(chunk: any, encoding?: string, cb?: Function): void {
                _response.send(chunk);
            }

        };

    }

    async doGetMessage(): Promise<string> {
        return this.request.body;
    }
    async handleError(err: Error): Promise<void> {
        this.response.statusCode = 500;
        this.response.end(err.message);
    }
    async handleMessage(message: string): Promise<void> {
        this.response.end(message);
    }
}
export class EventContext extends AbstractContext {

    constructor(public event: string, public context: any, public callback: Callback) {
        super(context);
    }

    async doGetMessage(): Promise<string> {
        return this.event;
    }

    async handleError(err: Error): Promise<void> {
        this.callback(err, undefined);
    }

    async handleMessage(message: string): Promise<void> {
        this.callback(undefined, message);
    }

}
