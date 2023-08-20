import { Middleware } from '../middleware';
import { Context } from '../context';
import { Autowired, Component, Logger } from '@malagu/core';
import { HTTP_MIDDLEWARE_PRIORITY } from './http-protocol';

@Component(Middleware)
export class HttpMiddleware implements Middleware {

    @Autowired(Logger)
    protected readonly logger: Logger;

    async handle(ctx: Context, next: () => Promise<void>): Promise<void> {
        const method = ctx.request.method;
        const path = ctx.request.path;
        this.logger.info(`starting ${method} ${path}`);
        const now = Date.now();
        try {
            await next();
            const response = ctx.response;
            if (!Context.isSkipAutoEnd() && !response.writableEnded) {
                response.end(response.body);
            }
        } finally {
            this.logger.info(`ending ${method} ${path} [${Date.now() - now}ms]`);
        }
    }

    readonly priority = HTTP_MIDDLEWARE_PRIORITY;

}
