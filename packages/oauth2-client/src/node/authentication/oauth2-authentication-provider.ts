import { Component, Autowired, Value } from '@malagu/core';
import { Context, RequestMatcher } from '@malagu/web/lib/node';
import { PathResolver, ENDPOINT } from '@malagu/web';
import { AuthorizationResponseUtil } from '../utils';
import { OAuth2AuthenticationError, AuthorizationRequest, OAuth2ParameterNames, OAuth2AuthorizationError, OAuth2ErrorCodes } from '@malagu/oauth2-core';
import { AuthorizationRequestManager, AuthorizedClientManager, AuthorizedClient, INVALID_STATE_PARAMETER_ERROR_CODE } from '../authorization';
import { ClientRegistrationManager } from '../registration';
import { AuthorizationCodeTokenResponseClient } from '../endpoint';
import { AuthenticationProvider } from '@malagu/security';
import { OAUTH2_AUTHENTICATION_PROVIDER_PRIORITY, AUTHORIZATION_REQUEST_NOT_FOUND_ERROR_CODE,
    CLIENT_REGISTRATION_NOT_FOUND_ERROR_CODE, OAuth2AuthorizationCodeAuthentication } from './authentication-protocol';

@Component(AuthenticationProvider)
export class OAuth2AuthenticationProvider implements AuthenticationProvider {

    @Value('malagu.oauth2.client')
    protected readonly options: any;

    @Autowired(AuthorizationRequestManager)
    protected readonly authorizationRequestManager: AuthorizationRequestManager<AuthorizationRequest>;

    @Autowired(ClientRegistrationManager)
    protected readonly clientRegistrationManager: ClientRegistrationManager;

    @Autowired(AuthorizedClientManager)
    protected readonly authorizedClientManager: AuthorizedClientManager<AuthorizedClient>;

    @Autowired(AuthorizationCodeTokenResponseClient)
    protected readonly authorizationCodeTokenResponseClient: AuthorizationCodeTokenResponseClient;

    @Autowired(RequestMatcher)
    protected readonly requestMatcher: RequestMatcher;

    @Autowired(PathResolver)
    protected readonly pathResolver: PathResolver;

    @Value(ENDPOINT)
    protected readonly endpoint: string;

    priority = OAUTH2_AUTHENTICATION_PROVIDER_PRIORITY;

    async authenticate(): Promise<OAuth2AuthorizationCodeAuthentication | undefined> {
        if (!AuthorizationResponseUtil.isAuthorizationResponse()) {
            throw new OAuth2AuthenticationError({
                errorCode: OAuth2ErrorCodes.INVALID_REQUEST
            });
        }

        const authorizationRequest = await this.authorizationRequestManager.get();
        if (!authorizationRequest) {
            throw new OAuth2AuthenticationError({
                errorCode: AUTHORIZATION_REQUEST_NOT_FOUND_ERROR_CODE
            });
        }

        const registrationId = authorizationRequest.attributes[OAuth2ParameterNames.REGISTRATION_ID];
        const clientRegistration = await this.clientRegistrationManager.get(registrationId);
        if (!clientRegistration) {
            throw new OAuth2AuthenticationError({
                errorCode: CLIENT_REGISTRATION_NOT_FOUND_ERROR_CODE,
                description: `Client Registration not found with Id: ${registrationId}`
            });
        }

        const redirectUri = await this.pathResolver.resolve(this.endpoint, Context.getRequest().path);
        const authorizationResponse = AuthorizationResponseUtil.convert(redirectUri);
        if (authorizationResponse.error) {
            throw new OAuth2AuthorizationError(authorizationResponse.error);
        }

        if (authorizationResponse.state !== authorizationRequest.state) {
            throw new OAuth2AuthorizationError({
                errorCode: INVALID_STATE_PARAMETER_ERROR_CODE
            });
        }

        const tokenResponse = await this.authorizationCodeTokenResponseClient.getTokenResponse({
            authorizationGrantType: clientRegistration.authorizationGrantType,
            clientRegistration,
            authorizationExchange: {
                authorizationRequest, authorizationResponse
            }
        });

        await this.authorizedClientManager.save({
            clientRegistration,
            accessToken: tokenResponse.accessToken,
            refreshToken: tokenResponse.refreshToken,
            principalName: clientRegistration.clientId
        }, clientRegistration.clientId);

        await this.authorizationRequestManager.remove();

        return {
            name: clientRegistration.clientId,
            principal: clientRegistration.clientId,
            credentials: tokenResponse.accessToken.tokenValue,
            clientRegistration,
            authorizationExchange: { authorizationRequest, authorizationResponse },
            accessToken: tokenResponse.accessToken,
            refreshToken: tokenResponse.refreshToken,
            additionalParameters: tokenResponse.additionalParameters,
            policies: [],
            authenticated: true
        };

    }

    async support(): Promise<boolean> {
        return !!await this.requestMatcher.match(await this.pathResolver.resolve(this.options.redirectLoginPath));
    }

}
