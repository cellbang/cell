import { RequestMatcher, Middleware, Context } from '@malagu/web/lib/node';
import { Component, Autowired, Value } from '@malagu/core';
import { LogoutHandler, LOGOUT_MIDDLEWARE_PRIORITY } from './logout-protocol';
import { LogoutSuccessHandlerProvider } from './logout-success-handler-provider';
import { PathResolver } from '@malagu/web';

@Component([LogoutMiddleware, Middleware])
export class LogoutMiddleware implements Middleware {

    @Autowired(LogoutHandler)
    protected readonly logoutHandlers: LogoutHandler[];

    @Autowired(LogoutSuccessHandlerProvider)
    protected readonly logoutSuccessHandlerProvider: LogoutSuccessHandlerProvider;

    @Value('malagu.security.logoutUrl')
    protected readonly logoutUrl: string;

    @Value('malagu.security.logoutMethod')
    protected readonly logoutMethod: string;

    @Autowired(PathResolver)
    protected readonly pathResolver: PathResolver;

    @Autowired(RequestMatcher)
    protected readonly requestMatcher: RequestMatcher;

    async handle(ctx: Context, next: () => Promise<void>): Promise<void> {
        if (await this.canHandle()) {
            for (const logoutHandler of this.logoutHandlers) {
                await logoutHandler.logout();
            }

            for (const logoutSuccessHandler of this.logoutSuccessHandlerProvider.provide()) {
                await logoutSuccessHandler.onLogoutSuccess();
            }
            return;
        }
        await next();

    }

    async canHandle(): Promise<boolean> {
        return !!await this.requestMatcher.match(await this.pathResolver.resolve(this.logoutUrl), this.logoutMethod);
    }

    readonly priority: number = LOGOUT_MIDDLEWARE_PRIORITY;

}
