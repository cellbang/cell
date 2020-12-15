import { Component, Value } from '@malagu/core';
import { Credentials, CredentialsProvider } from '../common';

@Component(CredentialsProvider)
export class DefaultCredentialsProvider implements CredentialsProvider {

    @Value('malagu.cloud.credentials')
    protected readonly credentials: Credentials;

    async provide(): Promise<Credentials | undefined> {
        return this.credentials;
    }

}
