import * as requestContext from 'express-http-context';
import { Session } from './session/session-protocol';
import { Cookies } from './cookies';
import { Request, Response } from './http/http-protocol';

export enum AttributeScope { App, Request, Session }

export const CURRENT_CONTEXT_REQUEST_KEY = 'CurrentContextRequest';
export const CURRENT_COOKIES_REQUEST_KEY = 'CurrentCookiesRequest';
export const CURRENT_SESSION_REQUEST_KEY = 'CurrentSessionRequest';
export const CURRENT_TRACE_ID_REQUEST_KEY = 'CurrentTraceIdRequest';

const appAttrs = new Map<string, any>();

export interface Context {

    [key: string]: any;

    readonly request: Request;

    readonly response: Response;

}

export namespace Context {

    export function run(fn: (...args: any[]) => void) {
        requestContext.ns.run(fn);
    }

    export function setCurrent(context: Context) {
        requestContext.set(CURRENT_CONTEXT_REQUEST_KEY, context);
    }

    export function getCurrent<T extends Context>(): T {
        return requestContext.get(CURRENT_CONTEXT_REQUEST_KEY);
    }

    export function getRequest(): Request {
        return getCurrent().request;
    }

    export function getResponse(): Response {
        return getCurrent().response;
    }

    export function getCookies(): Cookies {
        return requestContext.get(CURRENT_COOKIES_REQUEST_KEY);
    }

    export function setCookies(cookies: Cookies): void {
        requestContext.set(CURRENT_COOKIES_REQUEST_KEY, cookies);
    }

    export function getSession(): Session {
        return requestContext.get(CURRENT_SESSION_REQUEST_KEY);
    }

    export function setSession(session: Session): void {
        requestContext.set(CURRENT_SESSION_REQUEST_KEY, session);
    }

    export function setTraceId(traceId: string): void {
        requestContext.set(CURRENT_TRACE_ID_REQUEST_KEY, traceId);
    }

    export function getTraceId(): string {
        return requestContext.get(CURRENT_TRACE_ID_REQUEST_KEY);
    }

    export function setAttr(key: string, value: any, scope: AttributeScope = AttributeScope.Request) {
        if (scope === AttributeScope.Request) {
            requestContext.set(key, value);
        } else if (scope === AttributeScope.Session) {
            getSession()[key] = value;
        } else {
            appAttrs.set(key, value);
        }
    }

    export function getAttr<T>(key: string, scope?: AttributeScope): T {
        if (scope) {
            if (scope === AttributeScope.Request) {
                return requestContext.get(key);
            } else if (scope === AttributeScope.Session) {
                return getSession()[key];
            } else {
                return appAttrs.get(key);
            }
        } else {
            let value = requestContext.get(key);
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
