import { Middleware } from '../middleware';
import { Context } from '../context';
import { Component, Autowired } from '../../common';
import { ChannelStrategy, CHANNEL_MIDDLEWARE_PRIORITY } from './channel-protocol';

@Component(Middleware)
export class ChannelMiddleware implements Middleware {

    @Autowired(ChannelStrategy)
    protected readonly channelStrategy: ChannelStrategy;

    async handle(ctx: Context, next: () => Promise<void>): Promise<void> {
        if (!ctx.channelStrategy) {
            ctx.channelStrategy = this.channelStrategy;
        }
        Context.setChannalStrategy(ctx.channelStrategy);
        await next();
    }

    readonly priority = CHANNEL_MIDDLEWARE_PRIORITY;

}
