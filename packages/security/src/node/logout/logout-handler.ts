import { LogoutHandler } from './logout-protocol';
import { Component } from '@celljs/core';
import { SecurityContext } from '../context';

@Component(LogoutHandler)
export class SecurityContextLogoutHandler implements LogoutHandler {

    async logout(): Promise<void> {
        SecurityContext.setCurrent(undefined);
    }

}
