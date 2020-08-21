import { AuthorizedClientProvider, AuthorizationContext, AuthorizedClient } from './authorization-protocol';
import { AuthorizationGrantType, OAuth2AuthorizationError, AccessToken } from '@malagu/oauth2-core';
import { Component, Autowired, Value } from '@malagu/core';
import { ClientRegistration } from '../registration';
import { ClientAuthorizationError } from '../error';
import { PasswordTokenResponseClient } from '../endpoint/password-token-response-client';

@Component(AuthorizedClientProvider)
export class PasswordAuthorizedClientProvider implements AuthorizedClientProvider {

    @Value('malagu.oauth2.client.clockSkew')
    protected readonly clockSkew: number;

    @Autowired(PasswordTokenResponseClient)
    protected readonly accessTokenResponseClient: PasswordTokenResponseClient;

    async provide(context: AuthorizationContext): Promise<AuthorizedClient | undefined> {
        const { clientRegistration, authorizedClient, attributes } = context;
        if (AuthorizationGrantType.Password !== clientRegistration.authorizationGrantType) {
            return ;
        }

        const username = attributes.get(AuthorizationContext.USERNAME_ATTRIBUTE_NAME);
        const password = attributes.get(AuthorizationContext.PASSWORD_ATTRIBUTE_NAME);

        if (!username || !password) {
            return;
        }

        if (authorizedClient && !this.hasTokenExpired(authorizedClient.accessToken)) {
            // If client is already authorized but access token is NOT expired than no
            // need for re-authorization
            return;
        }

        if (authorizedClient && this.hasTokenExpired(authorizedClient.accessToken) && authorizedClient.refreshToken) {
            // If client is already authorized and access token is expired and a refresh
            // token is available, than return and allow
            // RefreshTokenAuthorizedClientProvider to handle the refresh
            return;
        }

        // As per spec, in section 4.4.3 Access Token Response
        // https://tools.ietf.org/html/rfc6749#section-4.4.3
        // A refresh token SHOULD NOT be included.
        //
        // Therefore, renewing an expired access token (re-authorization)
        // is the same as acquiring a new access token (authorization).
        const tokenResponse = await this.getTokenResponse(clientRegistration, username, password);
        return {
            clientRegistration,
            principalName: context.principal.name,
            accessToken: tokenResponse.accessToken
        };
    }

    hasTokenExpired(accessToken: AccessToken) {
        return accessToken.expiresAt - Date.now() < this.clockSkew;
    }

    protected getTokenResponse(clientRegistration: ClientRegistration, username: string, password: string) {
        try {
            return this.accessTokenResponseClient.getTokenResponse({
                authorizationGrantType: AuthorizationGrantType.Password,
                clientRegistration,
                username,
                password

            });
        } catch (error) {
            if (error instanceof OAuth2AuthorizationError) {
                throw new ClientAuthorizationError(error.oauth2Error, clientRegistration.registrationId, error);
            }
            throw error;
        }
    }

}
