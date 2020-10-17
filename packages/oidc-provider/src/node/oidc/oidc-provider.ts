import { Autowired, Component, Value } from '@malagu/core';
import { OidcProvider } from './oidc-protocol';
import { Provider } from 'oidc-provider';
import { ConfigurationProvider } from '../configuration';
import { ENDPOINT } from '@malagu/web';

@Component(OidcProvider)
export class OidcProviderImpl implements OidcProvider {

    @Autowired(ConfigurationProvider)
    protected readonly configurationProvider: ConfigurationProvider;

    @Value(ENDPOINT)
    protected readonly endpoint: string;

    protected oidc: Provider;

    async get(): Promise<Provider> {
        if (this.oidc) {
            this.oidc = new Provider(this.endpoint, await this.configurationProvider.get());
        }
        return this.oidc;
    }

}
