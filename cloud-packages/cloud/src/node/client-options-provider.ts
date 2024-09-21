import { Component, Value } from '@celljs/core';
import { ClientOptions, ClientOptionsProvider } from '../common';

@Component(ClientOptionsProvider)
export class DefaultClientOptionsProvider implements ClientOptionsProvider {

    @Value('cell.cloud.client')
    protected readonly clientOptions: ClientOptions;

    async provide(): Promise<ClientOptions | undefined> {
        return this.clientOptions;
    }

}
