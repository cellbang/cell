import { Session, SessionStrategy, SessionStore, COOKIE_EXP_DATE } from './session-protocol';
import { Autowired, Value, Component } from '../../common';
import { Context } from '../context';

@Component(SessionStore)
export class CookieSessionStore implements SessionStore {

    protected session: Session | undefined;

    @Value('session')
    protected readonly sessionOptions: any;

    @Autowired(SessionStrategy)
    protected readonly sessionStrategy: SessionStrategy;

    async get(id: string): Promise<Session | undefined> {
        const value = Context.getCookies().get(this.sessionOptions.sessionKey, this.sessionOptions);
        if (value) {
            return await this.sessionStrategy.create(JSON.parse(Buffer.from(value, 'base64').toString('utf8')));
        }
    }

    async set(session: Session): Promise<void> {
        Context.getCookies().set(this.sessionOptions.sessionKey, Buffer.from(JSON.stringify(session.toJSON())).toString('base64'), this.sessionOptions);
    }

    async remove(id: string): Promise<void> {
        Context.getCookies().set(this.sessionOptions.sessionKey, '', {
            expires: COOKIE_EXP_DATE,
            maxAge: false,
        });
    }

}
