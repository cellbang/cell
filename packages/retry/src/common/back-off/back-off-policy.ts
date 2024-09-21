import { Component, timeout } from '@celljs/core';
import { BackOffContext, BackOffPolicy } from './back-off-protocol';
import { RetryContext } from '../retry';

@Component(BackOffPolicy)
export class DefaultBackOffPolicyImpl implements BackOffPolicy {
    async start(ctx: RetryContext): Promise<BackOffContext> {
        const { backOffOptions } = ctx;
        const delay = typeof backOffOptions?.delay === 'function' ? await backOffOptions.delay() : backOffOptions?.delay;
        return {
            delay: delay ?? 100,
            startTime: Date.now(),
            retryContext: ctx
        };
    }
    async backOff(ctx: BackOffContext): Promise<void> {
        const { retryContext, delay } = ctx;
        const { backOffOptions } = retryContext;
        if (!backOffOptions) {
            return;
        }
        const minDelay = typeof backOffOptions.delay === 'function' ? await backOffOptions.delay() : (backOffOptions.delay ?? 100);
        const maxDelay = typeof backOffOptions.maxDelay === 'function' ? await backOffOptions.maxDelay() : backOffOptions.maxDelay;
        const multiplier = backOffOptions?.multiplier;
        const random = backOffOptions?.random;
        let nextDelay = delay;
        if (maxDelay) {
            if (multiplier) {
                if (random) {
                    nextDelay =  Math.floor(nextDelay * (1 + Math.random() * (multiplier - 1)));
                } else {
                    nextDelay = nextDelay * multiplier;
                }
            } else {
                nextDelay = minDelay + Math.floor(Math.random() * (maxDelay - minDelay));
            }
            nextDelay = Math.min(maxDelay, nextDelay);
        }
        ctx.delay = nextDelay;
        await timeout(nextDelay);
    }

}
