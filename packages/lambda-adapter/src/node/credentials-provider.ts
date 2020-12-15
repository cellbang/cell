import { DefaultCredentialsProvider } from '@malagu/cloud/lib/node';
import { Component } from '@malagu/core';
import { Credentials, CredentialsProvider } from '@malagu/cloud';

@Component({ id: CredentialsProvider, rebind: true })
export class FaaSCredentialsProvider extends DefaultCredentialsProvider {

    async provide(): Promise<Credentials | undefined> {
        const credentials = await super.provide();
        if (credentials) {
            return credentials;
        }
        return {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
            accessKeySecret: process.env.AWS_SECRET_ACCESS_KEY!,
            token: process.env.AWS_SESSION_TOKEN
        };
    }

}
