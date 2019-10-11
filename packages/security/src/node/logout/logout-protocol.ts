import { SECURITY_CONTEXT_MIDDLEWARE_PRIORITY } from '../context';

export const LogoutHandler = Symbol('LogoutHandler');
export const LogoutSuccessHandler = Symbol('LogoutSuccessHandler');

export const LOGOUT_MIDDLEWARE_PRIORITY = SECURITY_CONTEXT_MIDDLEWARE_PRIORITY - 50;

export interface LogoutHandler {
    logout(): Promise<void>;
}

export interface LogoutSuccessHandler {
    onLogoutSuccess(): Promise<void>;
}
