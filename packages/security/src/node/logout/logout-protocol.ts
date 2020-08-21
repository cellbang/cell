import { SECURITY_CONTEXT_MIDDLEWARE_PRIORITY } from '../context';

export const LogoutHandler = Symbol('LogoutHandler');
export const LogoutSuccessHandler = Symbol('LogoutSuccessHandler');

export const LOGOUT_MIDDLEWARE_PRIORITY = SECURITY_CONTEXT_MIDDLEWARE_PRIORITY - 100;

export const LOGOUT_SUCCESS_HANDLER_PRIORITY =  2000;

export interface LogoutHandler {
    logout(): Promise<void>;
}

export interface LogoutSuccessHandler {
    readonly priority: number;
    onLogoutSuccess(): Promise<void>;
}
