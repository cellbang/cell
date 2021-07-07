const createNamespace = require('cls-hooked').createNamespace;
import { Session } from './session/session-protocol';
import { Cookies } from './cookies';
import { Request, Response } from './http/http-protocol';

// eslint-disable-next-line @typescript-eslint/no-shadow
export enum AttributeScope { App, Request, Session }

export const CURRENT_CONTEXT_REQUEST_KEY = 'CurrentContextRequest';
export const CURRENT_COOKIES_REQUEST_KEY = 'CurrentCookiesRequest';
export const CURRENT_SESSION_REQUEST_KEY = 'CurrentSessionRequest';
export const CURRENT_TRACE_ID_REQUEST_KEY = 'CurrentTraceIdRequest';
export const CURRENT_SKIP_AUTO_END_REQUEST_KEY = 'CurrentSkipAutoEndRequest';
export const CURRENT_TENANT_REQUEST_KEY = 'CurrentTenantRequest';

const appAttrs = new Map<string, any>();

const store = createNamespace('3f45efdf-383c-4152-877b-1e98a410e0da');

export interface Context {

    [key: string]: any;

    readonly request: Request;

    readonly response: Response;

}

export namespace Context {

    export function run(fn: (...args: any[]) => void) {
        store.run(() => fn());
    }

    export function setCurrent(context: Context) {
        store.set(CURRENT_CONTEXT_REQUEST_KEY, context);
    }

    export function getCurrent<T extends Context>(): T {
        return store.get(CURRENT_CONTEXT_REQUEST_KEY);
    }

    export function getRequest(): Request {
        return getCurrent().request;
    }

    export function getResponse(): Response {
        return getCurrent().response;
    }

    export function getCookies(): Cookies {
        return store.get(CURRENT_COOKIES_REQUEST_KEY);
    }

    export function setCookies(cookies: Cookies): void {
        store.set(CURRENT_COOKIES_REQUEST_KEY, cookies);
    }

    export function getSession(): Session {
        return store.get(CURRENT_SESSION_REQUEST_KEY);
    }

    export function setSession(session: Session): void {
        store.set(CURRENT_SESSION_REQUEST_KEY, session);
    }

    export function setTraceId(traceId: string): void {
        store.set(CURRENT_TRACE_ID_REQUEST_KEY, traceId);
    }

    export function getTraceId(): string {
        return store.get(CURRENT_TRACE_ID_REQUEST_KEY);
    }

    export function setTenant(tenant: string): void {
        store.set(CURRENT_TENANT_REQUEST_KEY, tenant);
    }

    export function getTenant(): string {
        return store.get(CURRENT_TENANT_REQUEST_KEY);
    }

    export function setSkipAutoEnd(skipAutoEnd: boolean): void {
        store.set(CURRENT_SKIP_AUTO_END_REQUEST_KEY, skipAutoEnd);
    }

    export function isSkipAutoEnd(): boolean {
        return !!store.get(CURRENT_SKIP_AUTO_END_REQUEST_KEY);
    }

    export function setAttr(key: string, value: any, scope: AttributeScope = AttributeScope.Request) {
        if (scope === AttributeScope.Request) {
            store.set(key, value);
        } else if (scope === AttributeScope.Session) {
            getSession()[key] = value;
        } else {
            appAttrs.set(key, value);
        }
    }

    export function getAttr<T>(key: string, scope?: AttributeScope): T {
        if (scope) {
            if (scope === AttributeScope.Request) {
                return store.get(key);
            } else if (scope === AttributeScope.Session) {
                return getSession()[key];
            } else {
                return appAttrs.get(key);
            }
        } else {
            let value = store.get(key);
            value = value ? value : getSession()[key];
            return value ? value : appAttrs.get(key);
        }
    }

}

export class HttpContext implements Context {
    [key: string]: any;

    constructor(public request: Request, public response: Response) {
    }
}
