import { UserService } from './user-protocol';
import { Value, Component } from '@malagu/core';
import { UsernameNotFoundError } from '../error';
import { User, UserType } from '../../common';

@Component(UserService)
export class UserServiceImpl implements UserService<string, User> {

    @Value('malagu.security')
    protected readonly options: any;

    async load(username: string): Promise<User> {
        if (this.options.username === username) {
            return {
                type: UserType.Memery,
                username,
                password: this.options.password,
                accountNonExpired: true,
                accountNonLocked: true,
                credentialsNonExpired: true,
                enabled: true,
                policies: []
            };
        }

        throw new UsernameNotFoundError(`Could not find: ${username}`);
    }
}
