import { JwsAlgorithms } from '@celljs/oauth2-jose';
import { ClientRegistration, JwsAlgorithmResolver } from './registration-protocol';
import { Component } from '@celljs/core';

@Component(JwsAlgorithmResolver)
export class DefaultJwsAlgorithmResolver implements JwsAlgorithmResolver {

    async reolve(clientRegistration: ClientRegistration): Promise<string> {
        return JwsAlgorithms.RS256;
    }

}
