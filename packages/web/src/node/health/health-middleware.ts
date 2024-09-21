import { Middleware } from '../middleware';
import { Context } from '../context';
import { Component, Value, Autowired } from '@celljs/core';
import { HealthExecutor, HealthOptions, HEALTH_MIDDLEWARE_PRIORITY } from './health-protocol';
import { NotFoundError } from '../error';
import { RequestMatcher } from '../matcher';
import { PathResolver } from '../../common/resolver';
import { HttpHeaders, MediaType } from '@celljs/http';

@Component(Middleware)
export class HealthMiddleware implements Middleware {

    @Autowired(HealthExecutor)
    protected readonly healthExecutor: HealthExecutor;

    @Autowired(RequestMatcher)
    protected readonly requestMatcher: RequestMatcher;

    @Autowired(PathResolver)
    protected readonly pathResolver: PathResolver;

    @Value('cell.health')
    protected readonly healthOptions: HealthOptions;

    async handle(ctx: Context, next: () => Promise<void>): Promise<void> {
        try {
            await next();
        } catch (error) {
            const { response } = ctx;
            if (error instanceof NotFoundError && !response.writableEnded) {
                const result = await this.match();
                if (result) {
                    const health = await this.healthExecutor.execute(result.indicatorName);
                    response.status(200);
                    response.setHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON);
                    response.body = JSON.stringify(health);
                    return;
                }
            }
            throw error;
        }
    }

    protected async match(): Promise<{ indicatorName?: string }> {
        const pattern = await this.pathResolver.resolve(this.healthOptions.url + '(/:indicatorName)');
        return this.requestMatcher.match(pattern, this.healthOptions.method);
    }

    readonly priority = HEALTH_MIDDLEWARE_PRIORITY;

}
