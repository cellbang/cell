import { SessionManager, Session, SessionStrategy, SessionStore, COOKIE_EXP_DATE } from './session-protocol';
import { Autowired, Value, Component } from '../../common';
import { Context } from '../context';

@Component(SessionManager)
export class SessionManagerImpl implements SessionManager {

    @Value('session.sessionIdKey')
    protected readonly sessionIdKey: string;

    @Autowired(SessionStrategy)
    protected readonly sessionStrategy: SessionStrategy;

    @Autowired(SessionStore)
    protected readonly sessionStore: SessionStore;

    protected async getSessionId() {
        const cookies = Context.getCookies();
        return cookies.get(this.sessionIdKey);
    }

    async get(): Promise<Session> {
        if (Context.getSession()) {
            return Context.getSession();
        }
        const sessionId = await this.getSessionId();
        if (sessionId) {
            const session = await this.sessionStore.get(sessionId);
            if (session && await this.sessionStrategy.valid(session)) {
                return session;
            }
        }
        return await this.sessionStrategy.create();
    }

    async remove(): Promise<void> {
        if (Context.getSession()) {
            await this.sessionStore.remove(Context.getSession().id);
        }
        Context.getCookies().set(this.sessionIdKey, '', {
            expires: COOKIE_EXP_DATE,
            maxAge: false,
        });
    }

    async commit(): Promise<void> {
        const session = Context.getSession();
        if (!session) {
            return;
        }
        if (await this.sessionStrategy.shouldSaveSession(session)) {
            await this.sessionStore.set(session);
            Context.getCookies().set(this.sessionIdKey, session.id);
        }
    }

}
