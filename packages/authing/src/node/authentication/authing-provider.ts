
import { Value, Component } from '@malagu/core';
const Authing = require('authing-js-sdk');

@Component()
export class AuthingProvider {

    @Value('malagu.authing.userPool')
    protected readonly userPool: any;

    protected auth: any;

    provide() {
        if (!this.auth) {
            const { accessToken, id, secret } = this.userPool;
            this.auth = new Authing(accessToken ? { accessToken } : { userPoolId: id, secret });
        }
        return this.auth;
    }
}
