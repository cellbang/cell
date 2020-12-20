import { User } from '../../common';
import { SECURITY_CONTEXT_MIDDLEWARE_PRIORITY } from '../context/context-protocol';

export const UserService = Symbol('UserService');
export const UserChecker = Symbol('UserChecker');
export const UserMapper = Symbol('UserMapper');

export const USER_MIDDLEWARE_PRIORITY = SECURITY_CONTEXT_MIDDLEWARE_PRIORITY - 100;

export interface UserService<R, U extends User> {
    load(userRequest: R): Promise<U>;
}

export interface UserChecker {
    check(user: User): Promise<void>;
}

export interface UserMapper {
    map(user: User): Promise<void>;
}
