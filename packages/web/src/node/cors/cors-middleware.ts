import { convertExpressMiddleware, Middleware } from '../middleware';
import { Context } from '../context';
import { Component, Value, Autowired } from '@malagu/core';
import * as cors from 'cors';
import { CORS, ENDPOINT, HttpHeaders } from '../../common';
import { CORS_MIDDLEWARE_PRIORITY } from './cors-protocol';
import { HandlerExecutionChain } from '../handler';

@Component([CorsMiddleware, Middleware])
export class CorsMiddleware implements Middleware {

    @Value(CORS)
    protected readonly options: any;

    @Value(ENDPOINT)
    protected readonly endpoint?: string;

    @Autowired(HandlerExecutionChain)
    protected handlerExecutionChain: HandlerExecutionChain;

    async handle(ctx: Context, next: () => Promise<void>): Promise<void> {
        return this.handlerExecutionChain.execute([
            convertExpressMiddleware(cors(this.options))
        ], () => {
            if (this.endpoint && !ctx.response.getHeader(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN)) {
                ctx.response.setHeader(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, this.endpoint);
            }
            return next();
        });
    }

    readonly priority = CORS_MIDDLEWARE_PRIORITY;

}
