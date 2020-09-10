import { JwsAlgorithms } from '@malagu/oauth2-jose';
import { ClientRegistration, JwsAlgorithmResolver } from './registration-protocol';
import { Component } from '@malagu/core';

@Component(JwsAlgorithmResolver)
export class DefaultJwsAlgorithmResolver implements JwsAlgorithmResolver {

    async reolve(clientRegistration: ClientRegistration): Promise<string> {
        return JwsAlgorithms.RS256;
    }

}
