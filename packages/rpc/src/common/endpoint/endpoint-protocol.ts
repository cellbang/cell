export const EndpointResolver = Symbol('EndpointResolver');

export interface EndpointResolver {
    resolve(serviceIdentifier: string): Promise<string>;
}
