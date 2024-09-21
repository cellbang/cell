import { DefaultCredentialsProvider } from '@celljs/cloud/lib/node';
import { Component } from '@celljs/core';
import { Credentials, CredentialsProvider } from '@celljs/cloud';

@Component({ id: CredentialsProvider, rebind: true })
export class FaaSCredentialsProvider extends DefaultCredentialsProvider {

    override async provide(): Promise<Credentials | undefined> {
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
