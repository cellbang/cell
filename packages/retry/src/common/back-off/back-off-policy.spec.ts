import * as chai from 'chai';
import * as sinon from 'sinon';
import { DefaultBackOffPolicyImpl } from './back-off-policy';
import { RetryContext } from '../retry';
import { BackOffContext } from './back-off-protocol';

const expect = chai.expect;

describe('DefaultBackOffPolicyImpl', () => {
    let backOffPolicy: DefaultBackOffPolicyImpl;

    beforeEach(() => {
        backOffPolicy = new DefaultBackOffPolicyImpl();
    });

    it('should return a BackOffContext with delay and startTime', async () => {
        const ctx: RetryContext = {
            startTime: Date.now(),
            retryCount: 0,
            retryErrors: [],
            notRetryErrors: [],
            backOffOptions: {
                delay: 100
            }
        };

        const result = await backOffPolicy.start(ctx);

        expect(result.delay).equals(100);
        expect(result.startTime).to.be.a('number');
        expect(result.retryContext).equals(ctx);
    });

    it('should return a BackOffContext with delay from a delay function', async () => {
        const ctx: RetryContext = {
            startTime: Date.now(),
            retryCount: 0,
            retryErrors: [],
            notRetryErrors: [],
            backOffOptions: {
                delay: async () => 200
            }
        };

        const result = await backOffPolicy.start(ctx);

        expect(result.delay).equals(200);
        expect(result.startTime).to.be.a('number');
        expect(result.retryContext).equals(ctx);
    });

    it('should return a BackOffContext with default delay if delay is not provided', async () => {
        const ctx: RetryContext = {
            startTime: Date.now(),
            retryCount: 0,
            retryErrors: [],
            notRetryErrors: [],
            backOffOptions: {}
        };

        const result = await backOffPolicy.start(ctx);

        expect(result.delay).equals(100);
        expect(result.startTime).to.be.a('number');
        expect(result.retryContext).equals(ctx);
    });

    it('should return a BackOffContext with delay and startTime', async () => {
        const ctx: RetryContext = {
            startTime: Date.now(),
            retryCount: 0,
            retryErrors: [],
            notRetryErrors: [],
            backOffOptions: {
                delay: 0
            }
        };

        const result = await backOffPolicy.start(ctx);

        expect(result.delay).equals(0);
        expect(result.startTime).to.be.a('number');
        expect(result.retryContext).equals(ctx);
    });

    describe('backOff', () => {
        it('should update the delay in the BackOffContext', async () => {
            const ctx: BackOffContext = {
                startTime: Date.now(),
                delay: 100,
                retryContext: {
                    startTime: Date.now(),
                    retryCount: 0,
                    retryErrors: [],
                    notRetryErrors: [],
                    backOffOptions: {
                        delay: 100,
                        maxDelay: 1000,
                        multiplier: 2,
                        random: false
                    }
                }
            };

            await backOffPolicy.backOff(ctx);

            expect(ctx.delay).equals(200);
        });

        it('should update the delay in the BackOffContext with random delay', async () => {
            const ctx: BackOffContext = {
                startTime: Date.now(),
                delay: 100,
                retryContext: {
                    startTime: Date.now(),
                    retryCount: 0,
                    retryErrors: [],
                    notRetryErrors: [],
                    backOffOptions: {
                        delay: 100,
                        maxDelay: 1000,
                        multiplier: 2,
                        random: true
                    }
                }
            };

            await backOffPolicy.backOff(ctx);

            expect(ctx.delay).to.be.greaterThan(100);
            expect(ctx.delay).to.be.lessThanOrEqual(200);
        });

        it('should not update the delay in the BackOffContext if backOffOptions is not provided', async () => {
            const ctx: BackOffContext = {
                startTime: Date.now(),
                delay: 100,
                retryContext: {
                    startTime: Date.now(),
                    retryCount: 0,
                    retryErrors: [],
                    notRetryErrors: []
                }
            };

            await backOffPolicy.backOff(ctx);

            expect(ctx.delay).equals(100);
        });

        it('should not update the delay in the BackOffContext if maxDelay is not provided', async () => {
            const ctx: BackOffContext = {
                startTime: Date.now(),
                delay: 100,
                retryContext: {
                    startTime: Date.now(),
                    retryCount: 0,
                    retryErrors: [],
                    notRetryErrors: [],
                    backOffOptions: {
                        delay: 100,
                        multiplier: 2,
                        random: false
                    }
                }
            };

            await backOffPolicy.backOff(ctx);

            expect(ctx.delay).equals(100);
        });

        it('should not update the delay in the BackOffContext if delay is greater than or equal to maxDelay', async () => {
            const ctx: BackOffContext = {
                startTime: Date.now(),
                delay: 1000,
                retryContext: {
                    startTime: Date.now(),
                    retryCount: 0,
                    retryErrors: [],
                    notRetryErrors: [],
                    backOffOptions: {
                        delay: 1000,
                        maxDelay: 1000,
                        multiplier: 2,
                        random: false
                    }
                }
            };

            await backOffPolicy.backOff(ctx);

            expect(ctx.delay).equals(1000);
        });

        it('should update the delay in the BackOffContext with random delay if random is true', async () => {
            const ctx: BackOffContext = {
                startTime: Date.now(),
                delay: 100,
                retryContext: {
                    startTime: Date.now(),
                    retryCount: 0,
                    retryErrors: [],
                    notRetryErrors: [],
                    backOffOptions: {
                        delay: 100,
                        maxDelay: 1000,
                        multiplier: 2,
                        random: true
                    }
                }
            };

            const randomStub = sinon.stub(Math, 'random').returns(0.5);

            await backOffPolicy.backOff(ctx);

            expect(ctx.delay).to.be.eq(150);

            randomStub.restore();
        });

        it('should update the delay in the BackOffContext with random delay if random is true and multiplier is not provided', async () => {
            const ctx: BackOffContext = {
                startTime: Date.now(),
                delay: 100,
                retryContext: {
                    startTime: Date.now(),
                    retryCount: 0,
                    retryErrors: [],
                    notRetryErrors: [],
                    backOffOptions: {
                        delay: 100,
                        maxDelay: 1000,
                        random: true
                    }
                }
            };

            await backOffPolicy.backOff(ctx);

            expect(ctx.delay).to.be.greaterThan(100);
            expect(ctx.delay).to.be.lessThanOrEqual(1000);
        });
    });
});
