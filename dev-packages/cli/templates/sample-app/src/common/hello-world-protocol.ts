export const HelloWorldServer = Symbol('HelloWorldServer');

export interface HelloWorldServer {
    say(): Promise<string>;
}
