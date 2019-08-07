import { Context } from './context';
import { injectable, multiInject, optional, inject } from 'inversify';
import { ConnectionHandler, ConnnectionFactory, ConsoleLogger } from '../../common';
import { Channel } from '../../common/jsonrpc/channel-protocol';

// tslint:disable:no-any
@injectable()
export class ChannelManager {

    protected _handlers = new Map<string, ConnectionHandler>();

    constructor(
        @multiInject(ConnectionHandler) @optional()
        protected readonly handlers: ConnectionHandler[],
        @inject(ConnnectionFactory) protected connnectionFactory: ConnnectionFactory<Channel>
    ) {
        for (const handler of handlers) {
            this._handlers.set(handler.path, handler);
        }
     }

    async handleChannels(ctx: Context): Promise<void> {
        ctx.handleChannels(async () => {
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
