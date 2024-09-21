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
            accessKeyId: process.env.TENCENTCLOUD_SECRETID!,
            accessKeySecret: process.env.TENCENTCLOUD_SECRETKEY!,
            token: process.env.TENCENTCLOUD_SESSIONTOKEN
        };
    }

}
