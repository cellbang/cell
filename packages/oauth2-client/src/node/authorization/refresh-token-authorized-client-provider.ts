import { AuthorizedClientProvider, AuthorizationContext, AuthorizedClient } from './authorization-protocol';
import { AuthorizationGrantType, OAuth2AuthorizationError, AccessToken } from '@malagu/oauth2-core';
import { Component, Autowired, Value } from '@malagu/core';
import { RefreshTokenTokenResponseClient } from '../endpoint';
import { ClientRegistration } from '../registration';
import { ClientAuthorizationError } from '../error';
import { ok } from 'assert';

@Component(AuthorizedClientProvider)
export class RefreshTokenAuthorizedClientProvider implements AuthorizedClientProvider {

    @Value('malagu.oauth2.client.clockSkew')
    protected readonly clockSkew: number;

    @Autowired(RefreshTokenTokenResponseClient)
    protected readonly accessTokenResponseClient: RefreshTokenTokenResponseClient;

    async provide(context: AuthorizationContext): Promise<AuthorizedClient | undefined> {
        const { clientRegistration, authorizedClient, attributes } = context;
        if (!authorizedClient || !authorizedClient.refreshToken || !this.hasTokenExpired(authorizedClient.accessToken)) {
            return;
        }

        const scopes = attributes.get(AuthorizationContext.REQUEST_SCOPE_ATTRIBUTE_NAME);

        ok(scopes || Array.isArray(scopes), `The context attribute must be of type Array '${AuthorizationContext.REQUEST_SCOPE_ATTRIBUTE_NAME}'`);

        const tokenResponse = await this.getTokenResponse(clientRegistration, authorizedClient, scopes);
        return {
            clientRegistration,
            principalName: context.principal.name,
            accessToken: tokenResponse.accessToken,
            refreshToken: tokenResponse.refreshToken
        };
    }

    hasTokenExpired(accessToken: AccessToken) {
        return accessToken.expiresAt - Date.now() < this.clockSkew;
    }

    protected getTokenResponse(clientRegistration: ClientRegistration, authorizedClient: AuthorizedClient, scopes?: string[]) {
        try {
            return this.accessTokenResponseClient.getTokenResponse({
                authorizationGrantType: AuthorizationGrantType.RefreshToken,
                clientRegistration,
                accessToken: authorizedClient.accessToken,
                refreshToken: authorizedClient.refreshToken!,
                scopes
            });
        } catch (error) {
            if (error instanceof OAuth2AuthorizationError) {
                throw new ClientAuthorizationError(error.oauth2Error, clientRegistration.registrationId, error);
            }
            throw error;
        }
    }

}
