import { AuthServer, Auth, User } from '../common/security-protocol';
import { injectable, inject } from 'inversify';
import { sign } from 'jsonwebtoken';
import { ConfigProvider } from '@malagu/core/lib/common/config-provider';
import { JWT_SECRET_OR_PUBLIC_KEY } from './middleware';

@injectable()
export class AuthServerImpl implements AuthServer {

    @inject(ConfigProvider)
    protected readonly configProvider: ConfigProvider;
    async login(username: string, password: string): Promise<Auth> {
        const user = this.findUser(username);
        if (user && await this.validatePassword(user, password)) {
            return {
                token: sign(user, await this.configProvider.get<string>(JWT_SECRET_OR_PUBLIC_KEY, '123456')),
                user: user
            };
        } else {
            throw new Error('User name or password error.');
        }
    }
    protected validatePassword(user: Promise<User | undefined>, password: string): Promise<boolean> {
        return Promise.resolve(true);
    }

    protected findUser(username: string): Promise<User | undefined> {
        return Promise.resolve({
            username: username
        });
    }

}
