import { Provider } from 'oidc-provider';
export const OidcProvider = Symbol('OidcProvider');

export interface OidcProvider {
    get(): Promise<Provider>;
}
