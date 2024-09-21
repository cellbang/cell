import { LogoutSuccessHandler, LOGOUT_SUCCESS_HANDLER_PRIORITY } from './logout-protocol';
import { Component, Value, Autowired } from '@celljs/core';
import { Context, RedirectStrategy } from '@celljs/web/lib/node';
import { XML_HTTP_REQUEST, HttpHeaders } from '@celljs/http';

@Component(LogoutSuccessHandler)
export class SimpleUrlLogoutSuccessHandler implements LogoutSuccessHandler {

    @Value('cell.security.logoutSuccessUrl')
    protected readonly logoutSuccessUrl: string;

    @Autowired(RedirectStrategy)
    protected readonly redirectStrategy: RedirectStrategy;

    readonly priority = LOGOUT_SUCCESS_HANDLER_PRIORITY;

    async onLogoutSuccess(): Promise<void> {
        if (Context.getRequest().get(HttpHeaders.X_REQUESTED_WITH) !== XML_HTTP_REQUEST) {
            await this.redirectStrategy.send(this.logoutSuccessUrl);
        }
    }
}
