import { AuthorizedClientProvider, AuthorizationContext, AuthorizedClient } from './authorization-protocol';
import { AuthorizationGrantType } from '@malagu/oauth2-core';
import { ClientAuthorizationRequiredError } from '../error';
import { Component } from '@malagu/core';

@Component(AuthorizedClientProvider)
export class AuthorizationCodeAuthorizedClientProvider implements AuthorizedClientProvider {
    async provide(context: AuthorizationContext): Promise<AuthorizedClient | undefined> {
        const { clientRegistration, authorizedClient } = context;
        if (AuthorizationGrantType.AuthorizationCode === clientRegistration.authorizationGrantType && !authorizedClient) {
            throw new ClientAuthorizationRequiredError(clientRegistration.registrationId);
        }
        return;
    }

}
