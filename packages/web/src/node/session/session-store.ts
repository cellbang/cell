import { Session, SessionStrategy, SessionStore, COOKIE_EXP_DATE } from './session-protocol';
import { Autowired, Value, Component, Logger } from '@celljs/core';
import { Context } from '../context';
const { gzip, ungzip } = require('node-gzip');

@Component(SessionStore)
export class CookieSessionStore implements SessionStore {

    protected session: Session | undefined;

    @Value('cell.session')
    protected readonly sessionOptions: any;

    @Autowired(SessionStrategy)
    protected readonly sessionStrategy: SessionStrategy;

    @Autowired(Logger)
    protected readonly logger: Logger;

    async get(id: string): Promise<Session | undefined> {
        const value = Context.getCookies().get(this.sessionOptions.sessionKey, this.sessionOptions);
        if (value) {
            try {
                const decompressed = await ungzip(Buffer.from(value, 'base64'));
                return this.sessionStrategy.create(JSON.parse(decompressed.toString()));
            } catch (error) {
                this.logger.error(error);
            }

        }
    }

    async set(session: Session): Promise<void> {
        const compressed = await gzip(JSON.stringify(session.toJSON()));
        Context.getCookies().set(this.sessionOptions.sessionKey, compressed.toString('base64'), this.sessionOptions);
    }

    async remove(id: string): Promise<void> {
        Context.getCookies().set(this.sessionOptions.sessionKey, '', {
            expires: COOKIE_EXP_DATE,
            maxAge: false,
        });
    }

}
