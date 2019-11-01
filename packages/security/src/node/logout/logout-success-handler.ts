import { LogoutSuccessHandler } from './logout-protocol';
import { Component, Value } from '@malagu/core';
import { Context } from '@malagu/web/lib/node';

@Component([SimpleUrlLogoutSuccessHandler, LogoutSuccessHandler])
export class SimpleUrlLogoutSuccessHandler implements LogoutSuccessHandler {

    @Value('malagu.security.logoutSuccessUrl')
    protected readonly logoutSuccessUrl: string;

    async onLogoutSuccess(): Promise<void> {
        Context.getResponse().statusCode = 302;
        Context.getResponse().setHeader('Location', this.logoutSuccessUrl);
    }
}
