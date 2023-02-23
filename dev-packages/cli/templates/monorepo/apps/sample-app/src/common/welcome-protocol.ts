export const WelcomeServer = Symbol('WelcomeServer');

export interface WelcomeServer {
    say(): Promise<string>;
}
