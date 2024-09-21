import { Middleware, Context } from '@celljs/web/lib/node';
import { Component, Autowired } from '@celljs/core';
import { ChannelStrategy, CHANNEL_MIDDLEWARE_PRIORITY, CURRENT_CHANNEL_STRATEGY_REQUEST_KEY } from './channel-protocol';
import { HttpHeaders, MediaType } from '@celljs/http';

@Component(Middleware)
export class ChannelMiddleware implements Middleware {

    @Autowired(ChannelStrategy)
    protected readonly channelStrategies: ChannelStrategy[];

    async handle(ctx: Context, next: () => Promise<void>): Promise<void> {
        for (const channelStrategy of this.channelStrategies) {
            if (await channelStrategy.support()) {
                Context.setAttr(CURRENT_CHANNEL_STRATEGY_REQUEST_KEY, channelStrategy);
                break;
            }
        }

        ctx.response.setHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_UTF8);

        await next();
    }

    readonly priority = CHANNEL_MIDDLEWARE_PRIORITY;

}
