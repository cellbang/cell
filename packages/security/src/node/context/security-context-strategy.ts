import { Component } from '@malagu/core';
import { SecurityContext, SecurityContextStrategy } from './context-protocol';
import { Authentication } from '../authentication';

export class SecurityContextImpl implements SecurityContext {
    authentication: Authentication;
}

@Component(SecurityContextStrategy)
export class SessionSecurityContextStrategy implements SecurityContextStrategy {

    create(): Promise<SecurityContext> {
        const securityContext = new SecurityContextImpl();
        securityContext.authentication = {
            principal: 'anonymousUser',
            policies: [],
            credentials: '',
            authenticated: false
        };
        return Promise.resolve(securityContext);
    }

}
