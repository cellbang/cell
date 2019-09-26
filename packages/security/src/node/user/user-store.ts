import { UserStore, User } from './user-protocol';
import { Value, Component } from '@malagu/core';
import { UsernameNotFoundError } from '../error';

@Component(UserStore)
export class UserStoreImpl implements UserStore {

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
                policies: []
            };
        }

        throw new UsernameNotFoundError(`Could not find: ${username}`);
    }
}
