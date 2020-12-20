export const ClientOptionsProvider = Symbol('ClientOptionsProvider');

export interface ClientOptions {
    timeout?: number;
    internal?: boolean;
    apiVersion?: string;
}

export interface ClientOptionsProvider {
    provide(): Promise<ClientOptions | undefined>
}
