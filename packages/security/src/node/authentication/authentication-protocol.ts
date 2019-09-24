import { SECURITY_CONTEXT_MIDDLEWARE_PRIORITY } from '../context';
import { Policy } from '../access';

export const AuthenticationProvider = Symbol('AuthenticationProvider');
export const AuthenticationManager = Symbol('AuthenticationManager');

export const AUTHENTICATION_MIDDLEWARE_PRIORITY = SECURITY_CONTEXT_MIDDLEWARE_PRIORITY - 100;
export const DEFAULT_AUTHENTICATION_PROVIDER__PRIORITY =  2000;

export interface AuthenticationManager {
    authenticate(): Promise<void>;
}

export interface AuthenticationProvider {
    readonly priority: number;
    authenticate(): Promise<Authentication>;
    support(): Promise<boolean>;
}

export interface Authentication {
    policies: Policy[];
    credentials: any;
    details?: any;
    principal: any;
    authenticated: boolean;
}
