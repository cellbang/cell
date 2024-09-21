import { Autowired, Component, Logger } from '@celljs/core';
import { RecoveryCallback, RetryCallback, RetryContext, RetryOperations, RetryOptions } from './retry-protocol';
import { RetryError } from '../error';
import { BackOffPolicy } from '../back-off/back-off-protocol';
import { RetryPolicy } from '../policy/policy-protocol';

@Component(RetryOperations)
export class RetryOperationsImpl implements RetryOperations {

    @Autowired(RetryPolicy)
    protected readonly retryPolicy: RetryPolicy;

    @Autowired(BackOffPolicy)
    protected readonly backOffPolicy: BackOffPolicy;

    @Autowired(Logger)
    protected readonly logger: Logger;

    protected initRetryContext(options: RetryOptions<any>): RetryContext {
        return {
            timeout: options.timeout,
            maxAttempts: options.maxAttempts,
            backOffOptions: options.backOffOptions,
            rollbackError: options.rollbackError,
            retryCount: 0,
            lastError: undefined,
            exhaustedOnly: options.exhaustedOnly,
            startTime: Date.now(),
            retryErrors: options.retryErrors ?? [],
            notRetryErrors: options.notRetryErrors ?? []
        };
    }

    protected async handleRetryExhausted<T>(ctx: RetryContext, recoveryCallback?: RecoveryCallback<T>): Promise<T> {
        if (recoveryCallback && !ctx.noRecovery) {
            try {
                return recoveryCallback(ctx);
            } catch (error) {
                throw this.wrapError(ctx.lastError);
            }
        }
        throw this.wrapError(ctx.lastError);
    }

    protected wrapError(error?: Error): RetryError {
        return new RetryError('Error occurred during retry: ' + error?.message);
    }

    async execute<T>(callback: RetryCallback<T>, options: RetryOptions<T> = {}): Promise<T> {
        const retryContext = this.initRetryContext(options);
        const backOffContext = await this.backOffPolicy.start(retryContext);
        const retryPolicy = this.retryPolicy;
        try {
            while (await retryPolicy.canRetry(retryContext)) {
                try {
                    return await callback(retryContext);
                } catch (error) {
                    retryContext.lastError = error;
                    retryContext.retryCount++;
                    if (await retryPolicy.canRetry(retryContext) && !retryContext.exhaustedOnly) {
                        await this.backOffPolicy.backOff(backOffContext);
                    }

                    this.logger.debug('Checking for rethrow: count=' + retryContext.retryCount);
                    if (retryContext.rollbackError && error instanceof retryContext.rollbackError) {
                        this.logger.debug('Rethrow in retry for policy: count=' + retryContext.retryCount);
                        throw error;
                    }
                }
            }
            this.logger.debug('Retry failed last attempt: count=' + retryContext.retryCount);
            return this.handleRetryExhausted<T>(retryContext, options.recoveryCallback);
        } catch (error) {
            throw this.wrapError(error);
        }
    }

}
