import { Component, TraceIdProvider } from '@malagu/core';
import { Context } from '../context';

@Component(TraceIdProvider)
export class TraceIdProviderImpl implements TraceIdProvider {

    provide(): string | undefined {
        return Context.getTraceId();
    }
}
