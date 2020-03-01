import { LogoutHandler } from './logout-protocol';
import { Component } from '@malagu/core';
import { SecurityContext } from '../context';

@Component([ SecurityContextLogoutHandler, LogoutHandler ])
export class SecurityContextLogoutHandler implements LogoutHandler {

    async logout(): Promise<void> {
        SecurityContext.setCurrent(undefined);
    }

}
