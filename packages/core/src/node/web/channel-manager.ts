import { Context } from './context';
import { optional } from 'inversify';
import { ConnectionHandler, ConnnectionFactory, ConsoleLogger } from '../../common';
import { Channel } from '../../common/jsonrpc/channel-protocol';
import { Component, Autowired } from '../../common/annotation';

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
        const ctx = Context.getCurrent();
        await ctx.handleChannels(async () => {
            const { id, path } = (await ctx.getMessage() as any);
            if (path) {
                const handler = this._handlers.get(this.getRealPath(path));
                if (handler) {
                    const channel = await ctx.createChannel(id);
                    handler.onConnection(this.connnectionFactory.create(channel, new ConsoleLogger()));
                    return channel;
                }
            }
            throw new Error('Cannot find a service for the path: ' + path);
        });
    }

    protected getRealPath(path: string): string {
        return <string>path.split(':').pop();
    }

}
