import * as requestContext from 'express-http-context';
import { Channel } from '../../common/jsonrpc/channel-protocol';
import { WebSocketChannel } from '../../common/jsonrpc/web-socket-channel';
import ws = require('ws');
import * as http from 'http';
import { Dispatcher } from './dispatcher-protocol';

export enum AttributeScope { App, Request }

export const CURRENT_CONTEXT_REQUEST_KEY = 'CurrentContextRequest';

const appAttrs = new Map<string, any>();

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
    body?: any;
}

export interface Context {

    readonly request: Request;

    readonly response: Response;

    getMessage(): Promise<Channel.Message>;

    handleError(err: Error): Promise<void>;

    handleMessage(message: any): Promise<void>;

    createChannel(id: number): Promise<Channel>

    handleChannels(channelFactory: () => Promise<Channel>): Promise<void>;

}

export namespace Context {

    export function run(fn: (...args: any[]) => void) {
        requestContext.ns.run(fn);
    }

    export function setCurrent(context: Context) {
        requestContext.set(CURRENT_CONTEXT_REQUEST_KEY, context);
    }

    export function getCurrent<T extends Context>(): T {
        return requestContext.get(CURRENT_CONTEXT_REQUEST_KEY);
    }

    export function setAttr(key: string, value: any, scope: AttributeScope = AttributeScope.Request) {
        if (scope === AttributeScope.Request) {
            requestContext.set(key, value);
        } else {
            appAttrs.set(key, value);
        }
    }

    export function getAttr<T>(key: string, scope?: AttributeScope): T {
        if (scope) {
            if (scope === AttributeScope.Request) {
                return requestContext.get(key);
            } else {
                return appAttrs.get(key);
            }
        } else {
            const value = requestContext.get(key);
            return value ? value : appAttrs.get(key);
        }
    }

}

interface CheckAliveWS extends ws {
    alive: boolean;
}

export class WebSocketContext implements Context {

    protected message: Channel.Message;
    protected socket: CheckAliveWS;
    protected checkAliveTimeout = 30000;
    protected channels = new Map<number, WebSocketChannel>();

    constructor(protected readonly server: ws.Server, socket: ws, protected dispatcher: Dispatcher<WebSocketContext>) {
        this.socket = <CheckAliveWS>socket;
        this.socket.alive = true;
        socket.on('pong', () => this.socket.alive = true);
        setInterval(() => {
            server.clients.forEach((s: CheckAliveWS) => {
                if (s.alive === false) {
                    s.terminate();
                    return;
                }
                s.alive = false;
                s.ping();
            });
        }, this.checkAliveTimeout);

        this.socket.on('message', data => {
            this.message = JSON.parse(data.toString());
            Context.run(() => this.dispatcher.dispatch(this));
        });
        this.socket.on('error', err => {
            for (const channel of this.channels.values()) {
                channel.fireError(err);
            }
        });
        this.socket.on('close', (code, reason) => {
            for (const channel of [...this.channels.values()]) {
                channel.close(code, reason);
            }
            this.channels.clear();
        });
    }

    async getMessage(): Promise<Channel.Message> {
        return this.message;
    }

    handleError(err: Error): Promise<void> {
        throw err;
    }

    async handleMessage(message: any): Promise<void> {
        if (this.socket.readyState < ws.CLOSING) {
            this.socket.send(message, err => {
                if (err) {
                    throw err;
                }
            });
        }
    }

    async createChannel(id: number): Promise<Channel> {
        return new WebSocketChannel(id, async content => {
            this.handleMessage(content);
        });
    }

    async handleChannels(channelFactory: () => Promise<Channel>): Promise<void> {
        try {
            const { id } = this.message;
            if (this.message.kind === 'open') {
                const channel = <WebSocketChannel> await channelFactory();
                channel.ready();
                this.channels.set(id, channel);
                channel.onClose(() => this.channels.delete(id));
            } else {
                const channel = this.channels.get(id);
                if (channel) {
                    channel.handleMessage(this.message);
                } else {
                    console.error('The ws channel does not exist', id);
                }
            }
        } catch (error) {
            console.error('Failed to handle message', { error, data: JSON.stringify(this.message) });
        }
    }

    get request(): Request {
        throw new Error('Method not supported.');
    }

    get response(): Response {
        throw new Error('Method not supported.');
    }

}
