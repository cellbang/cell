import { Channel, HttpChannel, WebSocketChannel } from '../../common/jsonrpc';
import { ChannelStrategy, CheckAliveWS } from './channel-protocol';
import { Context } from '../context';
import ws = require('ws');
import { Component } from '../../common/annotation';
import { Deferred } from '../../common';

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

    async handleError(err: Error): Promise<void> {
        console.error(err);
        throw err;
    }

    async handleMessage(message: string): Promise<void> {
        const deferred = Context.getResponse().body;
        deferred.resolve(message);
    }

}

export class WebSocketChannelStrategy implements ChannelStrategy {

    protected message: Channel.Message;

    constructor(public socket: CheckAliveWS, protected channels: Map<number, WebSocketChannel>) {
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

}
