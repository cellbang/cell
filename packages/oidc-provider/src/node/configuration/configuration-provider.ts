import { Component, Value } from '@malagu/core';
import { ConfigurationProvider } from './configuration-protocol';
import { Configuration } from 'oidc-provider';

@Component(ConfigurationProvider)
export class ConfigurationProviderImpl implements ConfigurationProvider {

    @Value('malagu["odic-provider"].config')
    protected readonly config: any = {};

    get(): Promise<Configuration> {
        return this.config;
    }

}
