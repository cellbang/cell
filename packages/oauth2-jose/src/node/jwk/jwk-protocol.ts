export const JwkSetManager = Symbol('JwkSetManager');

export interface JwkSetManager<T> {
    get(jwksUri: string): Promise<T>;
}
