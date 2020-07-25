import { LoginUserManager, User } from './user-protocol';
import { BehaviorSubject } from 'rxjs';
import { Component } from '@malagu/core';

@Component(LoginUserManager)
export class LoginUserManagerImpl implements LoginUserManager {

    protected readonly loginUserStorageKey = 'malagu:loginUser';

    userSubject: BehaviorSubject<User | undefined> = new BehaviorSubject<User | undefined>(undefined);

    constructor() {
        const userStr = localStorage.getItem(this.loginUserStorageKey);
        if (userStr) {
            this.userSubject.next(JSON.parse(userStr));
        }
        this.userSubject.subscribe(user => {
            if (user) {
                localStorage.setItem(this.loginUserStorageKey, JSON.stringify(user));
            } else {
                localStorage.removeItem(this.loginUserStorageKey);
            }
        });
    }

}
