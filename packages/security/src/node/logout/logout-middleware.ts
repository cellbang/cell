import { Middleware, Context, RequestMatcher } from '@malagu/core/lib/node';
import { Component, Autowired, Value } from '@malagu/core';
import { LogoutHandler, LogoutSuccessHandler, LOGOUT_MIDDLEWARE_PRIORITY } from './logout-protocol';

@Component(Middleware)
export class LogoutMiddleWare implements Middleware {

    @Autowired(LogoutHandler)
    protected readonly logoutHandlers: LogoutHandler[];

    @Autowired(LogoutSuccessHandler)
    protected readonly logoutSuccessHandlers: LogoutSuccessHandler[];

    @Value('malagu.security.logoutUrl')
    protected readonly logoutUrl: string;

    @Autowired(RequestMatcher)
    protected readonly requestMatcher: RequestMatcher;

    async handle(ctx: Context, next: () => Promise<void>): Promise<void> {
        if (await this.requiresLogout()) {
            for (const logoutHandler of this.logoutHandlers) {
                await logoutHandler.logout();
            }

            for (const logoutSuccessHandler of this.logoutSuccessHandlers) {
                await logoutSuccessHandler.onLogoutSuccess();
            }
            return;
        }

        await next();
    }

    protected async requiresLogout(): Promise<boolean> {
        return !!await this.requestMatcher.match(this.logoutUrl, 'POST');
    }

    readonly priority: number = LOGOUT_MIDDLEWARE_PRIORITY;

}
