import { Middleware } from '../middleware';
import { Context } from '../context';
import { Component, Value } from '@malagu/core';
import * as cors from 'cors';
import { CORS } from '../../common';
import { CORS_MIDDLEWARE_PRIORITY } from './cors-protocol';

@Component(Middleware)
export class CorsMiddleware implements Middleware {

    @Value(CORS)
    protected readonly options: any;

    async handle(ctx: Context, next: () => Promise<void>): Promise<void> {
        return new Promise((resolve, reject) => cors(this.options)(ctx.request as any, ctx.response as any, () => next().then(resolve).catch(reject)));
    }

    readonly priority = CORS_MIDDLEWARE_PRIORITY;

}
