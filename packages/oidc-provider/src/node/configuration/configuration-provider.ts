import { Component, Value } from '@celljs/core';
import { ConfigurationProvider } from './configuration-protocol';
import { Configuration } from 'oidc-provider';

@Component(ConfigurationProvider)
export class ConfigurationProviderImpl implements ConfigurationProvider {

    @Value('cell["odic-provider"].config')
    protected readonly config: any = {};

    get(): Promise<Configuration> {
        return this.config;
    }

}
