import { Context, AttributeScope } from '@malagu/web/lib/node';
export const CURRENT_SECURITY_CONTEXT_REQUEST_KEY = 'CurrentSecurityContextRequest';

export interface Authentication {}

export namespace SecurityContext {

    export function getAuthentication(): Authentication {
        return  Context.getAttr(CURRENT_SECURITY_CONTEXT_REQUEST_KEY, AttributeScope.Request);
    }

    export function setAuthentication(authentication: Authentication): void {
        Context.setAttr(CURRENT_SECURITY_CONTEXT_REQUEST_KEY, authentication, AttributeScope.Request);
    }

}
