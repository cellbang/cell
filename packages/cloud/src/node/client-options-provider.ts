import { Component, Value } from '@malagu/core';
import { ClientOptions, ClientOptionsProvider } from '../common';

@Component(ClientOptionsProvider)
export class DefaultClientOptionsProvider implements ClientOptionsProvider {

    @Value('malagu.cloud.client')
    protected readonly clientOptions: ClientOptions;

    async provide(): Promise<ClientOptions | undefined> {
        return this.clientOptions;
    }

}
