import { Configuration } from 'oidc-provider';
export const ConfigurationProvider = Symbol('ConfigurationProvider');

export interface ConfigurationProvider {
    get(): Promise<Configuration>;
}
