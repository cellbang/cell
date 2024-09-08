import { CustomError } from '@malagu/core';

export const RetryOperations = Symbol('RetryOperations');

/**
 * Represents the context for retrying an operation.
 */
export interface RetryContext {
    startTime: number;
    maxAttempts?: number;
    timeout?: number;
    backOffOptions?: BackOffOptions;
    rollbackError?: typeof CustomError;
    retryCount: number;
    lastError?: Error;
    exhaustedOnly?: boolean;
    noRecovery?: boolean;
    retryErrors: (typeof CustomError)[];
    notRetryErrors: (typeof CustomError)[];
}

export interface RetryCallback<T> {
    (): Promise<T>;
}

export interface RetryCallback<T> {
    (ctx: RetryContext): Promise<T>;
}

export interface RecoveryCallback<T> {
    (ctx: RetryContext): Promise<T>;
}

export interface FixedBackoffOptions {
    /**
     * Set the back off period in milliseconds. Cannot be < 1. Default value is 1000ms.
     */
    period: number;
}

export interface BackOffOptions {
    /**
     * A canonical backoff period. Used as an initial value in the exponential case, and
     * as a minimum value in the uniform case.
     * The initial or canonical backoff period in milliseconds.
     */
    delay?: number | (() => Promise<number>);
    /**
     * If positive, then used as a multiplier for generating the next delay for backoff.
     * A multiplier to use to calculate the next backoff delay.
     */
    multiplier?: number;
    /**
     * The maximum wait in milliseconds between retries. If less than {@link delay}
     * then a default value is applied depending on the resulting policy.
     * The maximum wait between retries in milliseconds.
     */
    maxDelay?: number | (() => Promise<number>);

    /**
     * In the exponential case ({@link multiplier} > 0) set this to true to have the
     * backoff delays randomized, so that the maximum delay is multiplier times the
     * previous delay and the distribution is uniform between the two values.
     * The flag to signal randomization is required.
     */
    random?: boolean;
}

/**
 * RetryOptions interface represents the options for retrying a task.
 *
 * @template T - The type of the recovery callback parameter.
 * @property {RecoveryCallback<T>} recoveryCallback - The callback function to recover from an error.
 * @property {typeof CustomError} rollbackError - The custom error class to rollback the operation.
 * @property {number} maxAttempts - The maximum number of attempts to retry the task.
 * @property {number} timeout - The timeout duration in milliseconds for each attempt.
 * @property {boolean} exhaustedOnly - Indicates whether to retry only when all attempts are exhausted.
 * @property {BackOffOptions} backOffOptions - The options for exponential backoff strategy.
 * @property {(typeof CustomError)[]} retryErrors - The list of custom error classes to retry on.
 * @property {(typeof CustomError)[]} notRetryErrors - The list of custom error classes to not retry on.
 */
export interface RetryOptions<T = any> {
    recoveryCallback?: RecoveryCallback<T>;
    rollbackError?: typeof CustomError;
    maxAttempts?: number;
    timeout?: number;
    exhaustedOnly?: boolean;
    backOffOptions?: BackOffOptions;
    retryErrors?: (typeof CustomError)[];
    notRetryErrors?: (typeof CustomError)[];

}

/**
 * RetryOperations interface represents the operations for retrying a task with different options.
 */
export interface RetryOperations {
    /**
     * Execute the callback function with the given options.
     *
     * @template T - The type of the return value of the callback function.
     * @param {RetryCallback<T>} callback - The callback function to execute.
     * @param {RetryOptions<T>} options - The options for retrying the task.
     * @returns {Promise<T>} - The result of the callback function
     * @throws {RetryError} - If an error occurred during retry.
     * @example
     * const result = await retryOperations.execute(async () => {
     *     // do something
     * }, { maxAttempts: 3, timeout: 1000 });
     * console.log(result);
     * @example
     * const result = await retryOperations.execute(async () => {
     *     // do something
     * }, { maxAttempts: 3, timeout: 1000, backOffOptions: { delay: 1000 } });
     * console.log(result);
     * @example
     * const result = await retryOperations.execute(async () => {
     *     // do something
     * }, { maxAttempts: 3, timeout: 1000, backOffOptions: { delay: 1000, multiplier: 2 } });
     * console.log(result);
     * @example
     * const result = await retryOperations.execute(async () => {
     *     // do something
     * }, { maxAttempts: 3, timeout: 1000, backOffOptions: { delay: 1000, multiplier: 2, random: true } });
     * console.log(result);
     * @example
     * const result = await retryOperations.execute(async () => {
     *     // do something
     * }, { maxAttempts: 3, timeout: 1000, backOffOptions: { delay: 1000, multiplier: 2, random: true, maxDelay: 5000 } });
     * console.log(result);
     */
    execute<T>(callback: RetryCallback<T>, options?: RetryOptions<T>): Promise<T>;
}
