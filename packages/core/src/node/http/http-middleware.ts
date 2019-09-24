import { Middleware } from '../middleware';
import { Context } from '../context';
import { Component, Deferred } from '../../common';
import { HTTP_MIDDLEWARE_PRIORITY } from './http-protocol';

@Component(Middleware)
export class HttpMiddleware implements Middleware {

    async handle(ctx: Context, next: () => Promise<void>): Promise<void> {
        await next();
        const response = ctx.response;
        if (!response.finished) {
            const body = response.body;
            if (body instanceof Deferred) {
                response.end(await body.promise);
            } else {
                response.end(response.body);
            }
        }
    }

    readonly priority = HTTP_MIDDLEWARE_PRIORITY;

}
