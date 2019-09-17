import { Middleware } from '../middleware';
import { Context } from '../context';
import { Component, Value, Autowired } from '../../common';
import { SessionManager } from './session-protocol';

@Component(Middleware)
export class SessionMiddleware implements Middleware {

    @Autowired(SessionManager)
    protected readonly sessionManager: SessionManager;

    @Value('session')
    protected readonly sessionOptions: any;

    async handle(ctx: Context, next: () => Promise<void>): Promise<void> {
        Context.setSession(await this.sessionManager.get());
        try {
            await next();
        } finally {
            if (this.sessionOptions.autoCommit) {
                await this.sessionManager.commit();
            }
        }
    }

    readonly priority = 500;

}
