// Be sure this middleware is always at first position
export const TRACE_MIDDLEWARE_PRIORITY = 2200;

export const TRACE_ID_REQUEST_FIELD = 'cell.trace.requestField';
export const TRACE_ID_RESPONSE_FIELD = 'cell.trace.responseField';

export const TraceIdResolver = Symbol('TraceIdResolver');

export interface TraceIdResolver {
    resolve(): Promise<string>;
}
