import { Policy } from '../access';

export const UserService = Symbol('UserService');
export const UserChecker = Symbol('UserChecker');

export interface User {
    username: string;
    password: string;
    policies: Policy[];
    accountNonExpired: boolean;
    accountNonLocked: boolean;
    credentialsNonExpired: boolean;
    enabled: boolean;
    claims?: { [key: string]: any};
    [key: string]: any;
}

export interface UserService<R, U extends User> {
    load(userRequest: R): Promise<U>;
}

export interface UserChecker {
    check(user: User): Promise<void>;
}
