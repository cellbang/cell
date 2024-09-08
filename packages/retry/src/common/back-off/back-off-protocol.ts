import { RetryContext } from '../retry/retry-protocol';

export const BackOffPolicy = Symbol('BackOffPolicy');

export interface BackOffPolicy {
    start(ctx: RetryContext): Promise<BackOffContext>;
    backOff(ctx: BackOffContext): Promise<void>;
}

export interface BackOffContext {
    delay: number;
    startTime: number;
    retryContext: RetryContext;
}
