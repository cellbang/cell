import { Context } from './context';
import { inject, injectable } from 'inversify';
import { ConnnectionFactory } from '../../common/jsonrpc';
import { MiddlewareProvider, compose } from '../middleware';
import { ErrorHandlerProvider } from './error-hander-provider';
import { ChannelManager } from './channel-manager';
import { Dispatcher } from './dispatcher-protocol';
import { Channel } from '../../common/jsonrpc/channel-protocol';

@injectable()
export class DispatcherImpl implements Dispatcher<Context> {

    constructor(
        @inject(ChannelManager) protected readonly channelManager: ChannelManager,
        @inject(MiddlewareProvider) protected middlewareProvider: MiddlewareProvider,
        @inject(ErrorHandlerProvider) protected errorHandlerProvider: ErrorHandlerProvider,
        @inject(ConnnectionFactory) protected connnectionFactory: ConnnectionFactory<Channel>

    ) {}

    async dispatch(ctx: Context): Promise<void> {
        try {
            const middleware = compose(this.middlewareProvider.provide());
            await middleware(ctx, {
                handle: async (c: Context, next: () => Promise<void>) => {
                    await this.handleMessage(c);
                },
                priority: 0
            });
        } catch (err) {
            await this.handleError(ctx, err);
        }
    }

    protected async handleError(ctx: Context, err: Error): Promise<void> {
        const errorHandlers = this.errorHandlerProvider.provide();
        for (const handler of errorHandlers) {
            if (await handler.canHandle(ctx, err)) {
                try {
                    await handler.handle(ctx, err);
                } catch (error) {
                    continue;
                }
                return;
            }
        }
    }

    protected async handleMessage(ctx: Context): Promise<void> {
        this.channelManager.handleChannels(ctx);
    }
}
