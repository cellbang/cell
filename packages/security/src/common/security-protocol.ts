export interface User {
}

export interface Auth {
    token: string
    user: User
}

export const userPath = '/services/user';

export const UserServer = Symbol('UserServer');

export interface UserServer {
    getUser(): Promise<User | undefined>;
}

export const authPath = '/services/auth';

export const AuthServer = Symbol('AuthServer');

export interface AuthServer {
    login(username: string, password: string): Promise<Auth>;
}

export const TokenServer = Symbol('TokenServer');

export interface TokenServer {
    getToken(): Promise<string | undefined>;
}
