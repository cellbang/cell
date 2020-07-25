import { BehaviorSubject } from 'rxjs';

export const LoginUserManager = Symbol('LoginUserManager');

export interface User {
    id: string;
    name: string;
    avatar: string;
    [key: string]: any;
}

export interface LoginUserManager {
    userSubject: BehaviorSubject<User | undefined>;
}
