import { User } from '../../common';
import { BehaviorSubject } from 'rxjs';

export const UserManager = Symbol('UserManager');

export interface UserManager {
    openLoginPage(newWindow?: boolean): Promise<void>;
    logout(): Promise<void>;
    getUesrInfo(): Promise<User | undefined>;
    userInfoSubject: BehaviorSubject<User | undefined>;
}
