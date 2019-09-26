import { Context, AttributeScope } from '@malagu/core/lib/node';
import { Authentication } from '../authentication';
import { SESSION_MIDDLEWARE_PRIORITY } from '@malagu/core/lib/node/session/session-protocol';

export const SECURITY_CONTEXT_MIDDLEWARE_PRIORITY = SESSION_MIDDLEWARE_PRIORITY - 100;
export const CURRENT_SECURITY_CONTEXT_REQUEST_KEY = 'CurrentSecurityContextRequest';

export const SecurityContextStore = Symbol('SecurityContextStore');
export const SecurityContextStrategy = Symbol('SecurityContextStrategy');

export interface SecurityContext {
    authentication: Authentication;
}

export interface SecurityContextStore {
    load(): Promise<SecurityContext>;
    save(context: SecurityContext): Promise<void>;
}

export interface SecurityContextStrategy {
    create(): Promise<SecurityContext>;
}

export namespace SecurityContext {

    export function setCurrent(context: SecurityContext) {
        Context.setAttr(CURRENT_SECURITY_CONTEXT_REQUEST_KEY, context);
    }

    export function getCurrent<T extends SecurityContext>(): T {
        return Context.getAttr(CURRENT_SECURITY_CONTEXT_REQUEST_KEY, AttributeScope.Request);
    }

    export function getAuthentication(): Authentication {
        return getCurrent().authentication;
    }

    export function setAuthentication(authentication: Authentication): void {
        getCurrent().authentication = authentication;
    }

}
