import { HandlerAdapter } from '@malagu/web/lib/node';
import { Component, Autowired } from '@malagu/core';
import { AuthenticationManager, AUTHENTICATION_HANDLER_ADAPTER_PRIORITY } from './authentication-protocol';

@Component(HandlerAdapter)
export class AuthenticationHandlerAdapter implements HandlerAdapter {

    @Autowired(AuthenticationManager)
    protected readonly authenticationManager: AuthenticationManager;

    async handle(): Promise<void> {
        await this.authenticationManager.authenticate();
    }

    canHandle(): Promise<boolean> {
        return this.authenticationManager.support();
    }

    readonly priority: number = AUTHENTICATION_HANDLER_ADAPTER_PRIORITY;

}
