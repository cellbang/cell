import { Channel, HttpChannel } from '../../common/jsonrpc';
import { ChannelStrategy } from './channel-protocol';
import { Component, Deferred } from '@malagu/core';
import { Context, HttpContext } from '@malagu/web/lib/node';

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
        return Context.getCurrent() instanceof HttpContext;
    }

}
