import { Component, TraceIdProvider } from '@celljs/core';
import { Context } from '../context';

@Component(TraceIdProvider)
export class TraceIdProviderImpl implements TraceIdProvider {

    provide(): string | undefined {
        return Context.getTraceId();
    }
}
