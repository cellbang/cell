import { Context, NotFoundError } from '@malagu/web/lib/node';
import { optional } from 'inversify';
import { ConnectionHandler, ConnnectionFactory, Channel } from '../../common';
import { Component, Autowired, ConsoleLogger, Deferred } from '@malagu/core';
import { CURRENT_CHANNEL_STRATEGY_REQUEST_KEY, ChannelStrategy } from './channel-protocol';

// tslint:disable:no-any
@Component()
export class ChannelManager {

    protected _handlers = new Map<string, ConnectionHandler>();

    constructor(
        @Autowired(ConnectionHandler) @optional()
        protected readonly handlers: ConnectionHandler[],
        @Autowired(ConnnectionFactory) protected connnectionFactory: ConnnectionFactory<Channel>
    ) {
        for (const handler of handlers) {
            this._handlers.set(handler.path, handler);
        }
    }

    async handleChannels(): Promise<void> {
        const channelStrategy: ChannelStrategy = Context.getAttr(CURRENT_CHANNEL_STRATEGY_REQUEST_KEY);
        Context.getResponse().body = new Deferred<any>();
        for (const message of await channelStrategy.getMessages()) {
            const { id, path } = message as any;
            if (path) {
                const handler = this._handlers.get(this.getRealPath(path));
                if (handler) {
                    const channel = await channelStrategy.createChannel(id);
                    handler.onConnection(this.connnectionFactory.create(channel, new ConsoleLogger()));
                    channel.handleMessage(message);
                }
                continue;
            }
            throw new NotFoundError(`Cannot find a service for the path: ${path}`);
        }
    }

    protected getRealPath(path: string): string {
        return <string>path.split(':').pop();
    }

}
