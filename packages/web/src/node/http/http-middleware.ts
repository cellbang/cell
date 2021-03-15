import { Middleware } from '../middleware';
import { Context } from '../context';
import { Component } from '@malagu/core';
import { HTTP_MIDDLEWARE_PRIORITY } from './http-protocol';

@Component(Middleware)
export class HttpMiddleware implements Middleware {

    async handle(ctx: Context, next: () => Promise<void>): Promise<void> {
        await next();
        const response = ctx.response;
        if (!Context.isSkipAutoEnd() && !response.writableEnded) {
            response.end(response.body);
        }
    }

    readonly priority = HTTP_MIDDLEWARE_PRIORITY;

}
