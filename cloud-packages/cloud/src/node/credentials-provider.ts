import { Component, Value } from '@celljs/core';
import { Credentials, CredentialsProvider } from '../common';

@Component(CredentialsProvider)
export class DefaultCredentialsProvider implements CredentialsProvider {

    @Value('cell.cloud.credentials')
    protected readonly credentials: Credentials;

    async provide(): Promise<Credentials | undefined> {
        return this.credentials;
    }

}
