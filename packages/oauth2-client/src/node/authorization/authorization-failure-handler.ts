import { AuthorizationSuccessHandler, AuthorizedClient, AuthorizedClientManager, AuthorizationFailureHandler } from './authorization-protocol';
import { Authentication } from '@malagu/security/lib/node';
import { Component, Autowired } from '@malagu/core';
import { OAuth2AuthorizationError, OAuth2ErrorCodes } from '@malagu/oauth2-core';
import { ClientAuthorizationError } from '../error';

@Component(AuthorizationSuccessHandler)
export class DefaultAuthorizationFailureHandler implements AuthorizationFailureHandler {

    @Autowired(AuthorizedClientManager)
    protected readonly authorizedClientManager: AuthorizedClientManager<AuthorizedClient>;

    async onAuthorizationFailure(oauth2AuthorizationError: OAuth2AuthorizationError, principal: Authentication): Promise<void> {
        if (oauth2AuthorizationError instanceof ClientAuthorizationError && this.hasRemovalErrorCode(oauth2AuthorizationError)) {
            await this.authorizedClientManager.remove(oauth2AuthorizationError.clientRegistrationId, principal.name);
        }
    }

    protected hasRemovalErrorCode(oauth2AuthorizationError: ClientAuthorizationError) {
        return [ OAuth2ErrorCodes.INVALID_TOKEN, OAuth2ErrorCodes.INVALID_GRANT ].findIndex( code => code === oauth2AuthorizationError.oauth2Error.errorCode);
    }

}
