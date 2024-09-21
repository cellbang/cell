import { UserMapper } from './user-protocol';
import { Component, Value } from '@celljs/core';
import { User, UserMapperRule } from '../../common';

@Component(UserMapper)
export class UserMapperImpl implements UserMapper {

    @Value('cell.security.userMapperRule')
    protected rules: { [id: string]: UserMapperRule };

    async map(user: User): Promise<void> {
        if (user.type && user.claims) {
            const rule = this.rules[user.type];
            if (rule) {
                for (const prop in rule) {
                    if (Object.prototype.hasOwnProperty.call(rule, prop)) {
                        const value = rule[prop];
                        if (value) {
                            user[prop] = user.claims[value];
                        }
                    }
                }
            }
        }
    }
}
