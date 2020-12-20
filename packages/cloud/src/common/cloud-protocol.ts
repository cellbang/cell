import { Autowired, ConfigUtil } from '@malagu/core';
import { AccountProvider } from './account-protocol';
import { ClientOptions, ClientOptionsProvider } from './client-protocol';
import { Credentials, CredentialsProvider } from './credentials-protocol';
import { RegionProvider } from './region-protocol';

export interface CloudService<T extends RawCloudService> {
    name: string;
    getRawCloudService(): Promise<T>;
    setRawCloudService(innerService: T): void;
}

export interface RawCloudService {

}

export abstract class AbstractCloudService<T> implements CloudService<T> {

    name: string;

    @Autowired(RegionProvider)
    protected readonly regionProvider: RegionProvider;

    @Autowired(CredentialsProvider)
    protected readonly credentialsProvider: CredentialsProvider;

    @Autowired(AccountProvider)
    protected readonly accountProvider: AccountProvider;

    @Autowired(ClientOptionsProvider)
    protected readonly clientOptionsProvider: ClientOptionsProvider;

    protected _rawCloudService: T;

    async getRawCloudService(): Promise<T> {
        if (!this._rawCloudService) {
            const accountProp = `malagu.cloud.${this.name}.account`;
            const clientProp = `malagu.cloud.${this.name}.client`;
            const regionProp = `malagu.cloud.${this.name}.region`;
            const credentialsProp = `malagu.cloud.${this.name}.credentials`;

            const account = ConfigUtil.get<Account>(accountProp) || await this.accountProvider.provide();
            const clientOptions = ConfigUtil.get<ClientOptions>(clientProp) || await this.clientOptionsProvider.provide() || { internal: true };
            const region = ConfigUtil.get<string>(regionProp) || await this.regionProvider.provide();
            if (!region) {
                throw Error(`Please configure region through the properties "malagu.cloud.credentials" or "${regionProp}"`);
            }
            const credentials = ConfigUtil.get<Credentials>(credentialsProp) || await this.credentialsProvider.provide();
            if (!credentials) {
                throw Error(`Please configure credentials through the properties "malagu.cloud.credentials" or "${credentialsProp}"`);
            }

            this._rawCloudService = await this.doCreateRawCloudService(credentials, region, clientOptions, account);
        }
        return this._rawCloudService;
    }

    setRawCloudService(rawCloudService: T): void {
        this._rawCloudService = rawCloudService;
    }

    protected abstract doCreateRawCloudService(credentials: Credentials, region: string, clientOptions: ClientOptions, account?: Account): Promise<T>;

}
