import { UserServer, User } from '../common/security-protocol';
import { Context } from '@malagu/core/lib/node';
import { TOKEN_DECODED } from './middleware/jwt-middleware';
import { injectable } from 'inversify';

@injectable()
export class UserServerImpl implements UserServer {
    getUser(): Promise<User | undefined> {
        return Promise.resolve(Context.getAttr(TOKEN_DECODED));
    }

}
