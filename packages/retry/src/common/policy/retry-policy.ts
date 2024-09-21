import { Component } from '@celljs/core';
import { RetryContext } from '../retry/retry-protocol';
import { RetryPolicy } from './policy-protocol';

@Component(RetryPolicy)
export class DefaultRetryPolicy implements RetryPolicy {

    async canRetry(ctx: RetryContext): Promise<boolean> {
        const { startTime, timeout, maxAttempts, retryCount, lastError, retryErrors, notRetryErrors } = ctx;
        if (timeout !== undefined && timeout < Date.now() - startTime) {
            return false;
        }
        if (maxAttempts !== undefined && maxAttempts < retryCount) {
            return false;
        }
        if (lastError) {
            if (notRetryErrors.length) {
                for (const item of notRetryErrors) {
                    if (lastError instanceof item) {
                        return false;
                    }
                }
            }
            if (retryErrors.length) {
                let includes = false;
                for (const item of retryErrors) {
                    if (lastError instanceof item) {
                        includes = true;
                        break;
                    }
                }
                if (!includes) {
                    return false;
                }
            }
        }
        return true;
    }
}
