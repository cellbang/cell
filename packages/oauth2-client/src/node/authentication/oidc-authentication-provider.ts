import { Component, Autowired, Value } from '@malagu/core';
import { Context, RequestMatcher } from '@malagu/web/lib/node';
import { PathResolver, ENDPOINT } from '@malagu/web';
import { AuthorizationResponseUtil } from '../utils';
import { OAuth2AuthenticationError, AuthorizationRequest, OAuth2ParameterNames,
    OidcScopes, AccessTokenResponse, OAuth2AuthorizationError, OidcParameterNames , OAuth2ErrorCodes} from '@malagu/oauth2-core';
import { AuthorizationRequestManager, INVALID_STATE_PARAMETER_ERROR_CODE, AuthorizedClientManager, AuthorizedClient } from '../authorization';
import { ClientRegistrationManager, IdTokenJwtDecoderFactory, ClientRegistration } from '../registration';
import { AuthorizationCodeTokenResponseClient } from '../endpoint';
import { Jwt } from '@malagu/oauth2-jose';
import { errors } from 'jose';
import { CLIENT_REGISTRATION_NOT_FOUND_ERROR_CODE, AUTHORIZATION_REQUEST_NOT_FOUND_ERROR_CODE, OAuth2LoginAuthentication } from './authentication-protocol';
import { Oidc2UserRequest, OidcUserService } from '../user';
import { UserService, User, UserChecker, AuthenticationProvider } from '@malagu/security';
import { OIDC_AUTHENTICATION_PROVIDER_PRIORITY, INVALID_ID_TOKEN_ERROR_CODE } from './authentication-protocol';

@Component(AuthenticationProvider)
export class OidcAuthenticationProvider implements AuthenticationProvider {

    @Value('malagu.oauth2.client')
    protected readonly options: any;

    @Autowired(AuthorizationRequestManager)
    protected readonly authorizationRequestManager: AuthorizationRequestManager<AuthorizationRequest>;

    @Autowired(ClientRegistrationManager)
    protected readonly clientRegistrationManager: ClientRegistrationManager;

    @Autowired(AuthorizedClientManager)
    protected readonly authorizedClientManager: AuthorizedClientManager<AuthorizedClient>;

    @Autowired(IdTokenJwtDecoderFactory)
    protected readonly idTokenJwtDecoderFactory: IdTokenJwtDecoderFactory;

    @Autowired(AuthorizationCodeTokenResponseClient)
    protected readonly authorizationCodeTokenResponseClient: AuthorizationCodeTokenResponseClient;

    @Autowired(OidcUserService)
    protected readonly userService: UserService<Oidc2UserRequest, User>;

    @Autowired(UserChecker)
    protected readonly userChecker: UserChecker;

    @Autowired(RequestMatcher)
    protected readonly requestMatcher: RequestMatcher;

    @Autowired(PathResolver)
    protected readonly pathResolver: PathResolver;

    @Value(ENDPOINT)
    protected readonly endpoint: string;

    priority = OIDC_AUTHENTICATION_PROVIDER_PRIORITY;

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

        // Section 3.1.2.1 Authentication Request - https://openid.net/specs/openid-connect-core-1_0.html#AuthRequest
        // scope
        //         REQUIRED. OpenID Connect requests MUST contain the "openid" scope value.
        if (authorizationRequest.scopes.indexOf(OidcScopes.OPENID) === -1) {
            // This is NOT an OpenID Connect Authentication Request so return undefined
            // and let OAuth2AuthenticationProvider handle it instead
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
        if (!additionalParameters[OidcParameterNames.ID_TOKEN]) {
            throw new OAuth2AuthenticationError({
                errorCode: INVALID_ID_TOKEN_ERROR_CODE,
                description: `Missing (required) ID Token in Token Response for Client Registration:  ${clientRegistration.registrationId}`
            });
        }

        const idToken = await this.createOidcToken(clientRegistration, tokenResponse);

        const user = await this.userService.load({
            idToken,
            clientRegistration,
            accessToken: tokenResponse.accessToken,
            additionalParameters
        });
        await this.userChecker.check(user);

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

    protected async createOidcToken(clientRegistration: ClientRegistration, tokenResponse: AccessTokenResponse): Promise<Jwt> {
        const jwtDecoder = await this.idTokenJwtDecoderFactory.create(clientRegistration);
        try {
            return jwtDecoder.decode(tokenResponse.additionalParameters[OidcParameterNames.ID_TOKEN]);
        } catch (error) {
            if (error instanceof errors.JOSEError) {
                throw new OAuth2AuthenticationError({
                    errorCode: INVALID_ID_TOKEN_ERROR_CODE,
                    description: error.message
                });
            }
            throw error;
        }
    }

    async support(): Promise<boolean> {
        return !!await this.requestMatcher.match(await this.pathResolver.resolve(this.options.redirectLoginPath));
    }

}
