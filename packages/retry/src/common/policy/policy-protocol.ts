import { RetryContext } from '../retry/retry-protocol';

export const RetryPolicy = Symbol('RetryPolicy');

export interface RetryPolicy {
    canRetry(ctx: RetryContext): Promise<boolean>;
}
