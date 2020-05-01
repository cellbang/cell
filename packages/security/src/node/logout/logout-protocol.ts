
export const LogoutHandler = Symbol('LogoutHandler');
export const LogoutSuccessHandler = Symbol('LogoutSuccessHandler');

export const LOGOUT_HANDLER_ADAPTER_PRIORITY =  3000;

export const LOGOUT_SUCCESS_HANDLER_PRIORITY =  2000;

export interface LogoutHandler {
    logout(): Promise<void>;
}

export interface LogoutSuccessHandler {
    readonly priority: number;
    onLogoutSuccess(): Promise<void>;
}
