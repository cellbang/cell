import { HTTP_MIDDLEWARE_PRIORITY } from '../http';

export const COOKIES_MIDDLEWARE_PRIORITY = HTTP_MIDDLEWARE_PRIORITY - 100;

export const Cookies = Symbol('Cookies');

export interface Cookies {
    get(name: string, opt?: any): string | undefined;
    set(name: string, vaule: string, opt?: any): void;
}
