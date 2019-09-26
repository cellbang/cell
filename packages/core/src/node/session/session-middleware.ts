import { Middleware } from '../middleware';
import { Context } from '../context';
import { Component, Value, Autowired } from '../../common';
import { SessionManager, SESSION_MIDDLEWARE_PRIORITY } from './session-protocol';

@Component(Middleware)
export class SessionMiddleware implements Middleware {

    @Autowired(SessionManager)
    protected readonly sessionManager: SessionManager;

    @Value('malagu.session')
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

    readonly priority = SESSION_MIDDLEWARE_PRIORITY;

}
