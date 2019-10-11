import { Middleware, Context } from '@malagu/core/lib/node';
import { Component, Autowired } from '@malagu/core';
import { AuthenticationManager, AUTHENTICATION_MIDDLEWARE_PRIORITY } from './authentication-protocol';

@Component(Middleware)
export class AuthenticationMiddleWare implements Middleware {

    @Autowired(AuthenticationManager)
    protected readonly authenticationManager: AuthenticationManager;

    async handle(ctx: Context, next: () => Promise<void>): Promise<void> {
        if (await this.authenticationManager.support()) {
            await this.authenticationManager.authenticate();
            return;
        }
        await next();
    }

    readonly priority: number = AUTHENTICATION_MIDDLEWARE_PRIORITY;

}
