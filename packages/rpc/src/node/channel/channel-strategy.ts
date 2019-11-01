import { Channel, HttpChannel, WebSocketChannel } from '../../common/jsonrpc';
import { ChannelStrategy, CheckAliveWS } from './channel-protocol';
import ws = require('ws');
import { Component, Deferred } from '@malagu/core';
import { WebSocketContext, Context, HttpContext } from '@malagu/web/lib/node';

@Component(ChannelStrategy)
export class HttpChannelStrategy implements ChannelStrategy {
    getMessage(): Promise<Channel.Message> {
        return Context.getRequest().body;
    }

    async createChannel(id: number): Promise<Channel> {
        return new HttpChannel(id, async content => {
            this.handleMessage(content);
        });
    }

    async handleChannels(channelFactory: () => Promise<Channel>): Promise<void> {
        const channel = await channelFactory();
        channel.handleMessage(await this.getMessage());
        Context.getResponse().body = new Deferred<any>();
    }

    async handleMessage(message: string): Promise<void> {
        const deferred = Context.getResponse().body;
        deferred.resolve(message);
    }

    async support(): Promise<boolean> {
        return Context.getCurrent() instanceof HttpContext && !(Context.getCurrent() instanceof WebSocketContext);
    }

}

@Component(ChannelStrategy)
export class WebSocketChannelStrategy implements ChannelStrategy {

    protected message: Channel.Message;

    protected checkAliveTimeout = 30000;

    async getMessage(): Promise<Channel.Message> {
        return this.message;
    }

    handleError(err: Error): Promise<void> {
        throw err;
    }

    async handleMessage(message: string): Promise<void> {
        const ctx: WebSocketContext = Context.getCurrent();
        if (ctx.socket.readyState < ws.CLOSING) {
            ctx.socket.send(message, err => {
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
            const channels = Context.getCurrent().channels;
            if (this.message.kind === 'open') {
                const channel = <WebSocketChannel> await channelFactory();
                channel.ready();
                channels.set(id, channel);
                channel.onClose(() => channels.delete(id));
            } else {
                const channel = channels.get(id);
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

    async support(): Promise<boolean> {
        if (Context.getCurrent() instanceof WebSocketContext) {
            const ctx = <any>Context.getCurrent();
            ctx.channels = new Map<number, WebSocketChannel>();
            const socket = <CheckAliveWS>ctx.socket;
            socket.alive = true;
            socket.on('pong', () => socket.alive = true);
            const server = ctx.server;
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

            socket.on('message', data => {
                this.message = JSON.parse(data.toString());
                Context.run(() => ctx.dispatcher.dispatch(ctx));
            });
            socket.on('error', err => {
                for (const channel of ctx.channels.values()) {
                    channel.fireError(err);
                }
            });
            socket.on('close', (code, reason) => {
                for (const channel of [...ctx.channels.values()]) {
                    channel.close(code, reason);
                }
                ctx.channels.clear();
            });
            return true;
        }
        return false;
    }

}
