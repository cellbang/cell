import { COOKIES_MIDDLEWARE_PRIORITY } from '../cookies';

export const Session = Symbol('Session');
export const SessionStore = Symbol('SessionStore');
export const SessionManager = Symbol('SessionManager');
export const SessionStrategy = Symbol('SessionStrategy');

export const COOKIE_EXP_DATE = new Date('Thu, 01 Jan 1970 00:00:00 GMT');

export const SESSION_MIDDLEWARE_PRIORITY = COOKIES_MIDDLEWARE_PRIORITY - 100;

export interface Session {
    id: string;
    isNew: boolean;
    expire: number;
    maxAge: number;
    readonly changed: boolean;
    [key: string]: any;
    toJSON(): any;

}

export interface SessionStore {
    get(id: string): Promise<Session | undefined>;
    set(session: Session): Promise<void>;
    remove(id: string): Promise<void>;
}

export interface SessionManager {

    get(): Promise<Session>;
    remove(): Promise<void>;
    commit(): Promise<void>;
}

export interface SessionStrategy {
    valid(session: Session): Promise<boolean>;
    create(obj?: any): Promise<Session>
    shouldSaveSession(session: Session): Promise<boolean>;
}
