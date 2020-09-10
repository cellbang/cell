import { AuthorizedClientProvider, AuthorizationContext, AuthorizedClient } from './authorization-protocol';
import { AuthorizationGrantType, OAuth2AuthorizationError, AccessToken } from '@malagu/oauth2-core';
import { Component, Autowired, Value } from '@malagu/core';
import { ClientCredentialsTokenResponseClient } from '../endpoint';
import { ClientRegistration } from '../registration';
import { ClientAuthorizationError } from '../error';

@Component(AuthorizedClientProvider)
export class ClientCredentialsAuthorizedClientProvider implements AuthorizedClientProvider {

    @Value('malagu.oauth2.client.clockSkew')
    protected readonly clockSkew: number;

    @Autowired(ClientCredentialsTokenResponseClient)
    protected readonly accessTokenResponseClient: ClientCredentialsTokenResponseClient;

    async provide(context: AuthorizationContext): Promise<AuthorizedClient | undefined> {
        const { clientRegistration, authorizedClient } = context;
        if (AuthorizationGrantType.ClientCredentials !== clientRegistration.authorizationGrantType) {
            return ;
        }

        if (authorizedClient && !this.hasTokenExpired(authorizedClient.accessToken)) {
            // If client is already authorized but access token is NOT expired than no
            // need for re-authorization
            return;
        }

        // As per spec, in section 4.4.3 Access Token Response
        // https://tools.ietf.org/html/rfc6749#section-4.4.3
        // A refresh token SHOULD NOT be included.
        //
        // Therefore, renewing an expired access token (re-authorization)
        // is the same as acquiring a new access token (authorization).
        const tokenResponse = await this.getTokenResponse(clientRegistration);
        return {
            clientRegistration,
            principalName: context.principal.name,
            accessToken: tokenResponse.accessToken
        };
    }

    hasTokenExpired(accessToken: AccessToken) {
        return accessToken.expiresAt - Date.now() < this.clockSkew;
    }

    protected getTokenResponse(clientRegistration: ClientRegistration) {
        try {
            return this.accessTokenResponseClient.getTokenResponse({
                authorizationGrantType: AuthorizationGrantType.ClientCredentials,
                clientRegistration
            });
        } catch (error) {
            if (error instanceof OAuth2AuthorizationError) {
                throw new ClientAuthorizationError(error.oauth2Error, clientRegistration.registrationId, error);
            }
            throw error;
        }
    }

}
