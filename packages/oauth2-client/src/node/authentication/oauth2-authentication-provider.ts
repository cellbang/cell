import { Component, Autowired, Value } from '@malagu/core';
import { Context, RequestMatcher } from '@malagu/web/lib/node';
import { PathResolver, ENDPOINT } from '@malagu/web';
import { AuthorizationResponseUtil } from '../utils';
import { OAuth2AuthenticationError, AuthorizationRequest, OAuth2ParameterNames, OAuth2AuthorizationError,
    OAuth2ErrorCodes, OidcScopes, AccessTokenResponse } from '@malagu/oauth2-core';
import { AuthorizationRequestManager, AuthorizedClientManager, AuthorizedClient, INVALID_STATE_PARAMETER_ERROR_CODE } from '../authorization';
import { ClientRegistration, ClientRegistrationManager } from '../registration';
import { AuthorizationCodeTokenResponseClient, OAuth2UserRequest } from '../endpoint';
import { AuthenticationProvider, UserChecker, UserService, UserMapper } from '@malagu/security/lib/node';
import { User } from '@malagu/security';

import { OAUTH2_AUTHENTICATION_PROVIDER_PRIORITY, AUTHORIZATION_REQUEST_NOT_FOUND_ERROR_CODE,
    CLIENT_REGISTRATION_NOT_FOUND_ERROR_CODE, OAuth2LoginAuthentication } from './authentication-protocol';
import { OAuth2UserService } from '../user';

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

    @Autowired(OAuth2UserService)
    protected readonly userService: UserService<OAuth2UserRequest, User>;

    @Autowired(UserChecker)
    protected readonly userChecker: UserChecker;

    @Autowired(UserMapper)
    protected readonly userMapper: UserMapper;

    @Autowired(AuthorizationCodeTokenResponseClient)
    protected readonly authorizationCodeTokenResponseClient: AuthorizationCodeTokenResponseClient;

    @Autowired(RequestMatcher)
    protected readonly requestMatcher: RequestMatcher;

    @Autowired(PathResolver)
    protected readonly pathResolver: PathResolver;

    @Value(ENDPOINT)
    protected readonly endpoint: string;

    priority = OAUTH2_AUTHENTICATION_PROVIDER_PRIORITY;

    protected checkScopes(scopes: string[]) {
        // Section 3.1.2.1 Authentication Request -
        // https://openid.net/specs/openid-connect-core-1_0.html#AuthRequest scope
        // REQUIRED. OpenID Connect requests MUST contain the "openid" scope value.
        if (scopes.indexOf(OidcScopes.OPENID) !== -1) {
            // This is an OpenID Connect Authentication Request so return null
            // and let OidcAuthorizationCodeAuthenticationProvider handle it instead
            return false;
        }
        return true;
    }

    protected getUserinfo(clientRegistration: ClientRegistration, tokenResponse: AccessTokenResponse, additionalParameters: { [key: string]: string }) {
        return this.userService.load({
            clientRegistration,
            accessToken: tokenResponse.accessToken,
            additionalParameters
        });
    }

    async authenticate(): Promise<OAuth2LoginAuthentication | undefined> {
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

        if (!this.checkScopes(authorizationRequest.scopes)) {
            return;
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
            throw new OAuth2AuthenticationError(authorizationResponse.error);
        }
        if (authorizationResponse.state !== authorizationRequest.state) {
            throw new OAuth2AuthenticationError({
                errorCode: INVALID_STATE_PARAMETER_ERROR_CODE
            });
        }

        let tokenResponse: AccessTokenResponse;
        try {
            tokenResponse = await this.authorizationCodeTokenResponseClient.getTokenResponse({
                authorizationGrantType: clientRegistration.authorizationGrantType,
                clientRegistration,
                authorizationExchange: {
                    authorizationRequest, authorizationResponse
                }
            });
        } catch (error) {
            if (error instanceof OAuth2AuthorizationError) {
                throw new OAuth2AuthenticationError(error.oauth2Error);
            }
            throw error;
        }

        const { additionalParameters } = tokenResponse;

        const user = await this.getUserinfo(clientRegistration, tokenResponse, additionalParameters);
        await this.userChecker.check(user);
        await this.userMapper.map(user);

        await this.authorizedClientManager.save({
            clientRegistration,
            accessToken: tokenResponse.accessToken,
            refreshToken: tokenResponse.refreshToken,
            principalName: user.username
        }, user.username);

        await this.authorizationRequestManager.remove();

        return {
            name: user.username,
            principal: user,
            credentials: '',
            policies: user.policies,
            clientRegistration,
            authorizationExchange: { authorizationRequest, authorizationResponse },
            accessToken: tokenResponse.accessToken,
            refreshToken: tokenResponse.refreshToken,
            authenticated: true
        };

    }

    async support(): Promise<boolean> {
        return !!await this.requestMatcher.match(await this.pathResolver.resolve(this.options.redirectLoginPath));
    }

}
