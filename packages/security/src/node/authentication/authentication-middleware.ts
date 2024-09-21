import { Middleware, Context } from '@celljs/web/lib/node';
import { Component, Autowired } from '@celljs/core';
import { AuthenticationManager, AUTHENTICATION_MIDDLE_PRIORITY } from './authentication-protocol';

@Component(Middleware)
export class AuthenticationMiddleware implements Middleware {

    @Autowired(AuthenticationManager)
    protected readonly authenticationManager: AuthenticationManager;

    async handle(ctx: Context, next: () => Promise<void>): Promise<void> {
        if (await this.authenticationManager.support()) {
            await this.authenticationManager.authenticate(next);
            return;
        }
        await next();
    }

    readonly priority: number = AUTHENTICATION_MIDDLE_PRIORITY;

}
