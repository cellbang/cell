import { LogoutSuccessHandler, LOGOUT_SUCCESS_HANDLER_PRIORITY } from './logout-protocol';
import { Component, Value, Autowired } from '@malagu/core';
import { Context, XML_HTTP_REQUEST, RedirectStrategy } from '@malagu/web/lib/node';
import { X_REQUESTED_WITH } from '@malagu/web/lib/node';

@Component([SimpleUrlLogoutSuccessHandler, LogoutSuccessHandler])
export class SimpleUrlLogoutSuccessHandler implements LogoutSuccessHandler {

    @Value('malagu.security.logoutSuccessUrl')
    protected readonly logoutSuccessUrl: string;

    @Autowired(RedirectStrategy)
    protected readonly redirectStrategy: RedirectStrategy;

    readonly priority = LOGOUT_SUCCESS_HANDLER_PRIORITY;

    async onLogoutSuccess(): Promise<void> {
        if (Context.getRequest().headers[X_REQUESTED_WITH] !== XML_HTTP_REQUEST) {
            await this.redirectStrategy.send(this.logoutSuccessUrl);
        }
    }
}
