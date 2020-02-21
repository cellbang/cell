import { Context, HttpError } from '@malagu/web/lib/node';
import { optional } from 'inversify';
import { ConnectionHandler, ConnnectionFactory, Channel } from '../../common';
import { Component, Autowired, ConsoleLogger } from '@malagu/core';
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
        await channelStrategy.handleChannels(async () => {
            const { id, path } = (await channelStrategy.getMessage() as any);
            if (path) {
                const handler = this._handlers.get(this.getRealPath(path));
                if (handler) {
                    const channel = await channelStrategy.createChannel(id);
                    handler.onConnection(this.connnectionFactory.create(channel, new ConsoleLogger()));
                    return channel;
                }
            }
            throw new HttpError(404, `Cannot find a service for the path: ${path}`);
        });
    }

    protected getRealPath(path: string): string {
        return <string>path.split(':').pop();
    }

}
