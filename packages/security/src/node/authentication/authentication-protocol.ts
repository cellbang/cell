import { Policy } from '../../common';
import { SECURITY_CONTEXT_MIDDLEWARE_PRIORITY } from '../context';

export const AuthenticationProvider = Symbol('AuthenticationProvider');
export const AuthenticationManager = Symbol('AuthenticationManager');
export const AuthenticationSuccessHandler = Symbol('AuthenticationSuccessHandler');
export const AUTHENTICATION_SCHEME_BASIC = 'Basic';

export const AUTHENTICATION_MIDDLE_PRIORITY = SECURITY_CONTEXT_MIDDLEWARE_PRIORITY - 100;

export const USERNAME_PASSWORD_AUTHENTICATION_PROVIDER_PRIORITY =  2000;
export const BASE_AUTHENTICATION_PROVIDER_PRIORITY =  USERNAME_PASSWORD_AUTHENTICATION_PROVIDER_PRIORITY - 100;

export interface AuthenticationManager {
    authenticate(next: () => Promise<void>): Promise<void>;
    support(): Promise<boolean>;
}

export interface AuthenticationProvider {
    readonly priority: number;
    authenticate(): Promise<Authentication | undefined>;
    support(): Promise<boolean>;
}

export interface Authentication {
    name: string;
    policies: Policy[];
    credentials: any;
    details?: any;
    principal: any;
    next?: boolean;
    authenticated: boolean;
}

export interface AuthenticationSuccessHandler {
    onAuthenticationSuccess(authentication: Authentication): Promise<void>;
}
