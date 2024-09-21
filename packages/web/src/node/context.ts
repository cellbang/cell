import { AttributeScope, Context as BaseContext } from '@celljs/core/lib/node';
import { Session } from './session/session-protocol';
import { Cookies } from './cookies';
import { Request, Response } from './http/http-protocol';

export { AttributeScope } from '@celljs/core/lib/node';
export const CURRENT_COOKIES_REQUEST_KEY = 'CurrentCookiesRequest';
export const CURRENT_SESSION_REQUEST_KEY = 'CurrentSessionRequest';
export const CURRENT_TRACE_ID_REQUEST_KEY = 'CurrentTraceIdRequest';
export const CURRENT_SKIP_AUTO_END_REQUEST_KEY = 'CurrentSkipAutoEndRequest';
export const CURRENT_TENANT_REQUEST_KEY = 'CurrentTenantRequest';

export interface Context {

    [key: string]: any;

}

export class Context extends BaseContext {

    constructor(public request: Request, public response: Response) {
        super();
    }

    static getRequest(): Request {
        return Context.getCurrent().request;
    }

    static getResponse(): Response {
        return Context.getCurrent().response;
    }

    static getCookies(): Cookies {
        return Context.getAttr(CURRENT_COOKIES_REQUEST_KEY, AttributeScope.Request);
    }

    static setCookies(cookies: Cookies): void {
        Context.setAttr(CURRENT_COOKIES_REQUEST_KEY, cookies, AttributeScope.Request);
    }

    static getSession(): Session {
        return Context.getAttr(CURRENT_SESSION_REQUEST_KEY, AttributeScope.Request);
    }

    static setSession(session: Session): void {
        Context.setAttr(CURRENT_SESSION_REQUEST_KEY, session, AttributeScope.Request);
    }

    static setTraceId(traceId: string): void {
        Context.setAttr(CURRENT_TRACE_ID_REQUEST_KEY, traceId, AttributeScope.Request);

    }

    static getTraceId(): string {
        return Context.getAttr(CURRENT_TRACE_ID_REQUEST_KEY, AttributeScope.Request);
    }

    static setTenant(tenant: string): void {
        Context.setAttr(CURRENT_TENANT_REQUEST_KEY, tenant, AttributeScope.Request);
    }

    static getTenant(): string {
        return Context.getAttr(CURRENT_TENANT_REQUEST_KEY, AttributeScope.Request);
    }

    static setSkipAutoEnd(skipAutoEnd: boolean): void {
        Context.setAttr(CURRENT_SKIP_AUTO_END_REQUEST_KEY, skipAutoEnd, AttributeScope.Request);
    }

    static isSkipAutoEnd(): boolean {
        return !!Context.getAttr(CURRENT_SKIP_AUTO_END_REQUEST_KEY, AttributeScope.Request);
    }

    static override setAttr(key: string, value: any, scope: AttributeScope = AttributeScope.Request) {
        if (scope === AttributeScope.Session) {
            Context.getSession()[key] = value;
        } else {
            BaseContext.setAttr(key, value, scope);
        }
    }

    static override getAttr<T>(key: string, scope?: AttributeScope): T {
        if (scope) {
            if (scope === AttributeScope.Session) {
                return Context.getSession()[key];
            } else {
                return BaseContext.getAttr<T>(key, scope);
            }
        } else {
            let value = BaseContext.getAttr<T>(key, AttributeScope.Request);
            value = value ? value : Context.getSession()[key];
            return value ? value : BaseContext.getAttr<T>(key, AttributeScope.App);
        }
    }

}

