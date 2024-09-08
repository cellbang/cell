import { coreTestModule } from '@malagu/core/lib/common/test/test-module';
import { RetryOperationsImpl } from './retry-operations';
import { RetryOptions, RetryContext, RetryOperations } from './retry-protocol';
import { RetryError } from '../error';
import { expect } from 'chai';
import { autoBind, ContainerFactory, ContainerProvider, ContainerUtil } from '@malagu/core';
import '../index';

describe('RetryOperationsImpl', () => {
    let retryOperations: RetryOperationsImpl;

    before(() => {
        const container = ContainerFactory.create(coreTestModule, autoBind());
        ContainerProvider.set(container);
        retryOperations = ContainerUtil.get(RetryOperations);
    });

    describe('initRetryContext', () => {
        it('should initialize RetryContext with provided options', () => {
            const options: RetryOptions<any> = {
                timeout: 5000,
                maxAttempts: 3,
                backOffOptions: { delay: 1000 },
                rollbackError: RetryError,
                exhaustedOnly: true,
                retryErrors: [RetryError],
                notRetryErrors: [Error]
            };

            const context: RetryContext = retryOperations['initRetryContext'](options);

            expect(context.timeout).to.equal(5000);
            expect(context.maxAttempts).to.equal(3);
            expect(context.backOffOptions).to.deep.equal({ delay: 1000 });
            expect(context.rollbackError).to.equal(RetryError);
            expect(context.exhaustedOnly).to.be.true;
            expect(context.retryErrors).to.deep.equal([RetryError]);
            expect(context.notRetryErrors).to.deep.equal([Error]);
            expect(context.retryCount).to.equal(0);
            expect(context.lastError).to.be.undefined;
            expect(context.startTime).to.be.a('number');
        });

        it('should set default values when options are not provided', () => {
            const options: RetryOptions<any> = {};

            const context: RetryContext = retryOperations['initRetryContext'](options);

            expect(context.timeout).to.be.undefined;
            expect(context.maxAttempts).to.be.undefined;
            expect(context.backOffOptions).to.be.undefined;
            expect(context.rollbackError).to.be.undefined;
            expect(context.exhaustedOnly).to.be.undefined;
            expect(context.retryErrors).to.deep.equal([]);
            expect(context.notRetryErrors).to.deep.equal([]);
            expect(context.retryCount).to.equal(0);
            expect(context.lastError).to.be.undefined;
            expect(context.startTime).to.be.a('number');
        });

        it('should correctly handle retryErrors and notRetryErrors options', () => {
            const options: RetryOptions<any> = {
                retryErrors: [RetryError],
                notRetryErrors: [Error]
            };

            const context: RetryContext = retryOperations['initRetryContext'](options);

            expect(context.retryErrors).to.deep.equal([RetryError]);
            expect(context.notRetryErrors).to.deep.equal([Error]);
        });
    });

    describe('handleRetryExhausted', () => {
        it('should return the result of the recovery callback', async () => {
            const recoveryCallback = async () => 2;
            const result = await retryOperations['handleRetryExhausted']({} as RetryContext, recoveryCallback);
            expect(result).to.equal(2);
        });

        it('should throw the last error if no recovery callback is provided', async () => {
            const error = new Error();
            try {
                await retryOperations['handleRetryExhausted']({ lastError: error } as RetryContext);
            } catch (e) {
                expect(e).to.be.instanceOf(RetryError);
            }
        });
    });

    describe('wrapError', () => {
        it('should return a RetryError', () => {
            const error = new Error();
            const result = retryOperations['wrapError'](error);
            expect(result).to.be.instanceOf(RetryError);
        });
    });

    describe('execute', () => {
        it('should execute the callback and return its result', async () => {
            const callback = async () => 2;
            const result = await retryOperations.execute(callback);
            expect(result).to.equal(2);
        });

        it('should retry the callback until the retry policy allows it', async () => {
            let count = 0;
            const callback = async () => {
                count++;
                if (count < 3) {
                    throw new Error();
                }
                return 2;
            };
            const result = await retryOperations.execute(callback, { maxAttempts: 5 });
            expect(result).to.equal(2);
            expect(count).to.equal(3);
        });

        it('should throw the last error if the retry policy does not allow retry', async () => {
            const callback = async () => {
                throw new Error();
            };
            try {
                await retryOperations.execute(callback, { maxAttempts: 1 });
            } catch (e) {
                expect(e).to.be.instanceOf(RetryError);
            }
        });

        it('should handle the retry exhausted case', async () => {
            const callback = async () => {
                throw new Error();
            };
            try {
                await retryOperations.execute(callback, { maxAttempts: 2, recoveryCallback: async () => 2 });
            } catch (e) {
                expect(e).to.equal(2);
            }
        });

        it('should handle the retry exhausted case with no recovery callback', async () => {
            const callback = async () => {
                throw new Error();
            };
            try {
                await retryOperations.execute(callback, { maxAttempts: 2 });
            } catch (e) {
                expect(e).to.be.instanceOf(RetryError);
            }
        });
    });

});
