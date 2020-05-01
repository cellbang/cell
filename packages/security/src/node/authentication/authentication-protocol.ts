import { Policy } from '../access';

export const AuthenticationProvider = Symbol('AuthenticationProvider');
export const AuthenticationManager = Symbol('AuthenticationManager');

export const AUTHENTICATION_HANDLER_ADAPTER_PRIORITY = 3000;
export const DEFAULT_AUTHENTICATION_PROVIDER_PRIORITY =  2000;

export interface AuthenticationManager {
    authenticate(): Promise<void>;
    support(): Promise<boolean>;
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
