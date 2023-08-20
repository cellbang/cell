import { Middleware } from '../middleware';
import { Context } from '../context';
import { Component, Autowired, Value } from '@malagu/core';
import { TRACE_MIDDLEWARE_PRIORITY, TRACE_ID_RESPONSE_FIELD, TraceIdResolver } from './trace-protocol';

@Component(Middleware)
export class TraceMiddleware implements Middleware {

    @Autowired(TraceIdResolver)
    protected readonly traceIdResolver: TraceIdResolver;

    @Value(TRACE_ID_RESPONSE_FIELD)
    protected readonly traceField: string;

    async handle(ctx: Context, next: () => Promise<void>): Promise<void> {
        const traceId = await this.traceIdResolver.resolve();
        Context.setTraceId(traceId);
        ctx.response.setHeader(this.traceField, traceId);
        await next();
    }

    readonly priority = TRACE_MIDDLEWARE_PRIORITY;

}
