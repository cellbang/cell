import { OAuth2AuthorizationError, OAuth2Error } from '@malagu/oauth2-core';
import { CLIENT_AUTHORIZATION_REQUIRED_ERROR_CODE } from './error-protocol';

export class ClientAuthorizationError extends OAuth2AuthorizationError {

    constructor(public override oauth2Error: OAuth2Error, public clientRegistrationId: string, error?: Error) {
        super(oauth2Error, error);
    }

}

export class ClientAuthorizationRequiredError extends ClientAuthorizationError {
    constructor(clientRegistrationId: string) {
        super({
            errorCode: CLIENT_AUTHORIZATION_REQUIRED_ERROR_CODE,
            description: `Authorization required for Client Registration Id: ${clientRegistrationId}`
        }, clientRegistrationId);
    }
}
