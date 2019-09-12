import {  Context, Dispatcher, Request, Response } from '@malagu/core/lib/node/web';
import { HttpChannel } from '@malagu/core/lib/common/jsonrpc/http-channel';
import { Channel } from '@malagu/core/lib/common/jsonrpc/channel-protocol';
import * as ws from 'ws';
import { WebSocketChannel } from '@malagu/core/lib/common/jsonrpc';
import { Context as KoaContext } from 'koa';

export const DEFAULT_SERVER_OPTIONS = {
    port: 3000,
    path: '/api'
};

interface CheckAliveWS extends ws {
    alive: boolean;
}

export class HttpContext implements Context {
    request: Request;
    response: Response;

    constructor(public context: KoaContext) {
        this.request = context.request.req as any;
        this.response = context.response.res;
    }

    getMessage(): Promise<Channel.Message> {
        return this.context.toJSON();
    }

    async createChannel(id: number): Promise<Channel> {
        return new HttpChannel(id, async content => {
            this.handleMessage(content);
        });
    }

    async handleChannels(channelFactory: () => Promise<Channel>): Promise<void> {
        await channelFactory();
    }

    async handleError(err: Error): Promise<void> {
        console.error(err);
        throw err;
    }
    async handleMessage(message: string): Promise<void> {
        this.context.body = message;
    }
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

    async handleMessage(message: string): Promise<void> {
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
