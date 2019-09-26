import { Policy } from '../access';

export const UserStore = Symbol('UserStore');
export const UserChecker = Symbol('UserChecker');

export interface User {
    username: string;
    password: string;
    policies: Policy[];
    accountNonExpired: boolean;
    accountNonLocked: boolean;
    credentialsNonExpired: boolean;
    enabled: boolean;
}

export interface UserStore {
    load(username: string): Promise<User>;
}

export interface UserChecker {
    check(user: User): Promise<void>;
}
