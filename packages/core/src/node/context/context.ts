const createNamespace = require('cls-hooked').createNamespace;

// eslint-disable-next-line @typescript-eslint/no-shadow
export enum AttributeScope { App, Request, Session }

export const CURRENT_CONTEXT_REQUEST_KEY = 'CurrentContextRequest';

const appAttrs = new Map<string, any>();

const store = createNamespace('3f45efdf-383c-4152-877b-1e98a410e0da');

export class Context {

    [key: string | symbol | number]: any;

    static run(fn: (...args: any[]) => void) {
        store.runPromise(async () => fn());
    }

    static bind(fn: (...args: any[]) => void, context?: any) {
        return store.bind(fn, context);
    }

    static setCurrent(context: Context) {
        store.set(CURRENT_CONTEXT_REQUEST_KEY, context);
    }

    static getCurrent<T extends Context>(): T {
        return store.get(CURRENT_CONTEXT_REQUEST_KEY);
    }

    static setAttr(key: string, value: any, scope: AttributeScope = AttributeScope.Request) {
        if (scope === AttributeScope.Request) {
            Context.getCurrent<Context>()[key] = value;
        } else if (scope === AttributeScope.Session) {
            Context.getCurrent()[key] = value;
        } else {
            appAttrs.set(key, value);
        }
    }

    static getAttr<T>(key: string, scope?: AttributeScope): T {
        if (scope) {
            if (scope === AttributeScope.Request) {
                return Context.getCurrent()?.[key];
            } else if (scope === AttributeScope.Session) {
                return Context.getCurrent()?.[key];
            } else {
                return appAttrs.get(key);
            }
        } else {
            let value = store.get(key);
            value = value ? value : Context.getCurrent()?.[key];
            return value ? value : appAttrs.get(key);
        }
    }

}
