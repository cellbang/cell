import { Component, Value, generateUUUID } from '@celljs/core';
import { TraceIdResolver, TRACE_ID_REQUEST_FIELD } from './trace-protocol';
import { Context } from '../context';

@Component(TraceIdResolver)
export class TraceIdResolverImpl implements TraceIdResolver {
    @Value(TRACE_ID_REQUEST_FIELD)
    protected readonly traceField: string;

    resolve(): Promise<string> {
        if (Context.getRequest() && this.traceField ) {
            const traceId = Context.getRequest().get(this.traceField);
            if (traceId) {
                return Promise.resolve(traceId);
            }
        }
        return Promise.resolve(generateUUUID());
    }
}
