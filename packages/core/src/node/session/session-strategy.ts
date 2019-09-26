import { SessionStrategy, Session } from './session-protocol';
import { SessionImpl } from './session';
import { Value, Component } from '../../common/annotation';

@Component(SessionStrategy)
export class SessionStrategyImpl implements SessionStrategy {

    @Value('malagu.session')
    protected readonly sessionOptions: any;

    async valid(session: Session): Promise<boolean> {
        if (session.expire && session.expire < Date.now()) {
            return false;
        }
        return true;
    }

    create(obj?: any): Promise<Session> {
        return Promise.resolve(new SessionImpl(this.sessionOptions, obj));
    }

    async shouldSaveSession(session: Session): Promise<boolean> {
        if (session.changed) {
            return true;
        }
        // save if opts.renew and session will expired
        if (this.sessionOptions.renew === true) {
            const expire = session.expire;
            const maxAge = session.maxAge;
            // renew when session will expired in maxAge / 2
            if (expire && maxAge && expire - Date.now() < maxAge / 2) {
                return true;
            }
        }
        return false;
    }
}
