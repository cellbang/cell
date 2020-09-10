import { User, UserService } from './user-protocol';
import { Value, Component } from '@malagu/core';
import { UsernameNotFoundError } from '../error';
import { ElPolicy, PolicyType } from '../access';
import { AuthorizeType } from '../annotation';

@Component(UserService)
export class UserServiceImpl implements UserService<string, User> {

    @Value('malagu.security')
    protected readonly options: any;

    async load(username: string): Promise<User> {
        if (this.options.username === username) {
            return {
                username,
                password: this.options.password,
                accountNonExpired: true,
                accountNonLocked: true,
                credentialsNonExpired: true,
                enabled: true,
                policies: [ <ElPolicy>{
                    type: PolicyType.El,
                    authorizeType: AuthorizeType.Pre,
                    el: 'true'
                } ]
            };
        }

        throw new UsernameNotFoundError(`Could not find: ${username}`);
    }
}
