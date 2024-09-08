import { DefaultRetryPolicy } from './retry-policy';
import { RetryContext } from '../retry/retry-protocol';
import * as chai from 'chai';
import { RetryError } from '../error';
const expect = chai.expect;

describe('DefaultRetryPolicy', () => {
    let retryPolicy: DefaultRetryPolicy;

    beforeEach(() => {
        retryPolicy = new DefaultRetryPolicy();
    });

    it('should return false if timeout is exceeded', async () => {
        const ctx: RetryContext = {
            startTime: Date.now(),
            timeout: 100, // 100 ms
            maxAttempts: 3,
            retryCount: 0,
            retryErrors: [],
            notRetryErrors: []
        };

        // Simulate timeout exceeded
        await new Promise(resolve => setTimeout(resolve, 200));

        const result = await retryPolicy.canRetry(ctx);

        expect(result).equals(false);
    });

    it('should return false if maxAttempts is exceeded', async () => {
        const ctx: RetryContext = {
            startTime: Date.now(),
            timeout: undefined,
            maxAttempts: 3,
            retryCount: 4,
            retryErrors: [],
            notRetryErrors: []
        };

        const result = await retryPolicy.canRetry(ctx);

        expect(result).equals(false);
    });

    it('should return false if lastError is in notRetryErrors', async () => {
        const ctx: RetryContext = {
            startTime: Date.now(),
            timeout: undefined,
            maxAttempts: undefined,
            retryCount: 0,
            lastError: new RetryError(),
            retryErrors: [],
            notRetryErrors: [RetryError]
        };

        const result = await retryPolicy.canRetry(ctx);

        expect(result).equals(false);
    });

    it('should return false if lastError is not in retryErrors', async () => {

        const ctx: RetryContext = {
            startTime: Date.now(),
            timeout: undefined,
            maxAttempts: undefined,
            retryCount: 0,
            lastError: new Error(),
            retryErrors: [RetryError],
            notRetryErrors: []
        };

        const result = await retryPolicy.canRetry(ctx);

        expect(result).equals(false);
    });

    it('should return true if none of the conditions are met', async () => {
        const ctx: RetryContext = {
            startTime: Date.now(),
            timeout: undefined,
            maxAttempts: undefined,
            retryCount: 0,
            retryErrors: [],
            notRetryErrors: []
        };

        const result = await retryPolicy.canRetry(ctx);

        expect(result).equals(true);
    });

    it('should return true if lastError is in retryErrors', async () => {
        const ctx: RetryContext = {
            startTime: Date.now(),
            timeout: undefined,
            maxAttempts: undefined,
            retryCount: 0,
            lastError: new RetryError(),
            retryErrors: [RetryError],
            notRetryErrors: []
        };

        const result = await retryPolicy.canRetry(ctx);

        expect(result).equals(true);
    });

    it('should return true if maxAttempts is not exceeded', async () => {
        const ctx: RetryContext = {
            startTime: Date.now(),
            timeout: undefined,
            maxAttempts: 3,
            retryCount: 2,
            retryErrors: [],
            notRetryErrors: []
        };

        const result = await retryPolicy.canRetry(ctx);

        expect(result).equals(true);
    });
});
