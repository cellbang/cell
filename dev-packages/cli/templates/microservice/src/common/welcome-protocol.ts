export const WelcomeServer = 'WelcomeServer';

export interface WelcomeServer {
    say(): Promise<string>;
}
