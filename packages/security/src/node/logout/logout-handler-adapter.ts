import { RequestMatcher, HandlerAdapter } from '@malagu/web/lib/node';
import { Component, Autowired, Value } from '@malagu/core';
import { LogoutHandler, LOGOUT_HANDLER_ADAPTER_PRIORITY } from './logout-protocol';
import { LogoutSuccessHandlerProvider } from './logout-success-handler-provider';

@Component([LogoutHanlderAdapter, HandlerAdapter])
export class LogoutHanlderAdapter implements HandlerAdapter {

    @Autowired(LogoutHandler)
    protected readonly logoutHandlers: LogoutHandler[];

    @Autowired(LogoutSuccessHandlerProvider)
    protected readonly logoutSuccessHandlerProvider: LogoutSuccessHandlerProvider;

    @Value('malagu.security.logoutUrl')
    protected readonly logoutUrl: string;

    @Value('malagu.security.logoutMethod')
    protected readonly logoutMethod: string;

    @Autowired(RequestMatcher)
    protected readonly requestMatcher: RequestMatcher;

    async handle(): Promise<void> {
        for (const logoutHandler of this.logoutHandlers) {
            await logoutHandler.logout();
        }

        for (const logoutSuccessHandler of this.logoutSuccessHandlerProvider.provide()) {
            await logoutSuccessHandler.onLogoutSuccess();
        }
    }

    async canHandle(): Promise<boolean> {
        return !!await this.requestMatcher.match(this.logoutUrl, this.logoutMethod);
    }

    readonly priority: number = LOGOUT_HANDLER_ADAPTER_PRIORITY;

}
