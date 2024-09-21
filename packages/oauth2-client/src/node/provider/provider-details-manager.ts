import { ProviderDetailsManager, ProviderDetails } from './provider-protocol';
import { Value, Component } from '@celljs/core';

@Component(ProviderDetailsManager)
export class InMemoryProviderDetailsManager implements ProviderDetailsManager {

    @Value('cell.oauth2.client.providers')
    protected providers: { [id: string]: ProviderDetails } = {};

    @Value('cell.oauth2.client.providerTemplates')
    protected readonly providerTemplates: { [id: string]: ProviderDetails } = {};

    protected initialized = false;

    async get(providerId: string): Promise<ProviderDetails | undefined> {
        if (!this.initialized) {
            for (const id in this.providers) {
                if (Object.prototype.hasOwnProperty.call(this.providers, id)) {
                    const template = this.providerTemplates[id];
                    const provider = { ...template, ...this.providers[id] };
                    provider.userInfoEndpoint = { ...template?.userInfoEndpoint, ...provider.userInfoEndpoint };
                    provider.configurationMetadata = { ...template?.configurationMetadata, ...provider.configurationMetadata };
                    this.providers[id] = provider;
                }
            }
            this.providers = this.providers || {};
            this.initialized = true;
        }

        return this.providers[providerId] || this.providerTemplates[providerId];
    }

}
