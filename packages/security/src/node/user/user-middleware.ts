import { RequestMatcher, Middleware, Context } from '@malagu/web/lib/node';
import { Component, Autowired, Value } from '@malagu/core';
import { PathResolver, HttpHeaders, MediaType } from '@malagu/web';
import { USER_MIDDLEWARE_PRIORITY } from './user-protocol';
import { SecurityContext } from '../context/context-protocol';

@Component(Middleware)
export class UserMiddleware implements Middleware {

    @Value('malagu.security.userInfoEndpoint')
    protected readonly userInfoEndpoint: any;

    @Autowired(PathResolver)
    protected readonly pathResolver: PathResolver;

    @Autowired(RequestMatcher)
    protected readonly requestMatcher: RequestMatcher;

    async handle(ctx: Context, next: () => Promise<void>): Promise<void> {
        if (await this.canHandle()) {
            const auth = SecurityContext.getAuthentication();
            if (auth.authenticated) {
                ctx.response.setHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_UTF8);
                ctx.response.body = JSON.stringify(auth.principal);
            }
            return;
        }
        await next();

    }

    async canHandle(): Promise<boolean> {
        const { url, method } = this.userInfoEndpoint;
        return !!await this.requestMatcher.match(await this.pathResolver.resolve(url), method);
    }

    readonly priority: number = USER_MIDDLEWARE_PRIORITY;

}
