import { Middleware, Context, RedirectStrategy, RequestMatcher } from '@malagu/web/lib/node';
import { Component, Value, Autowired } from '@malagu/core';
import { AuthorizationRequestResolver, AuthorizationRequestManager, AUTHORIZATION_CODE_GRANT_MIDDLEWARE_PRIORITY,
    AuthorizedClientManager, AuthorizedClient, INVALID_STATE_PARAMETER_ERROR_CODE } from './authorization-protocol';
import { AuthorizationRequest, OAuth2ParameterNames, OAuth2AuthorizationError, OAuth2Error } from '@malagu/oauth2-core';
import { AuthorizationResponseUtil } from '../utils';
import { ClientRegistrationManager, ClientRegistration } from '../registration';
import { ENDPOINT, PathResolver } from '@malagu/web';
import { SecurityContext, RequestCache } from '@malagu/security/lib/node';
import { AuthorizationCodeTokenResponseClient } from '../endpoint';

@Component(Middleware)
export class AuthorizationCodeGrantMiddleware implements Middleware {

    @Autowired(AuthorizationRequestManager)
    protected readonly authorizationRequestManager: AuthorizationRequestManager<AuthorizationRequest>;

    @Autowired(AuthorizationRequestResolver)
    protected readonly authorizationRequestResolver: AuthorizationRequestResolver;

    @Autowired(ClientRegistrationManager)
    protected readonly clientRegistrationManager: ClientRegistrationManager;

    @Autowired(AuthorizedClientManager)
    protected readonly authorizedClientManager: AuthorizedClientManager<AuthorizedClient>;

    @Autowired(RedirectStrategy)
    protected readonly redirectStrategy: RedirectStrategy;

    @Autowired(RequestMatcher)
    protected readonly requestMatcher: RequestMatcher;

    @Autowired(PathResolver)
    protected readonly pathResolver: PathResolver;

    @Autowired(RequestCache)
    protected readonly requestCache: RequestCache;

    @Autowired(AuthorizationCodeTokenResponseClient)
    protected readonly authorizationCodeTokenResponseClient: AuthorizationCodeTokenResponseClient;

    @Value(ENDPOINT)
    protected readonly endpoint: string;

    @Value('malagu.oauth2.client.redirectLoginPath')
    protected readonly redirectLoginPath: string;

    async handle(ctx: Context, next: () => Promise<void>): Promise<void> {
        if (await this.matchesAuthorizationResponse()) {
            await this.processAuthorizationResponse();
        }
        await next();

    }

    async processAuthorizationResponse() {
        const authorizationRequest = <AuthorizationRequest>await this.authorizationRequestManager.remove();
        const registrationId = authorizationRequest.attributes[OAuth2ParameterNames.REGISTRATION_ID];
        const clientRegistration = <ClientRegistration> await this.clientRegistrationManager.get(registrationId!);
        const redirectUri = await this.pathResolver.resolve(this.endpoint, Context.getRequest().path);
        const authorizationResponse = AuthorizationResponseUtil.convert(redirectUri);
        if (authorizationResponse.error) {
            throw new OAuth2AuthorizationError(authorizationResponse.error);
        }
        if (authorizationResponse.state !== authorizationRequest.state) {
            throw new OAuth2AuthorizationError(<OAuth2Error>{
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

        const authentication = SecurityContext.getAuthentication();
        const principalName = authentication.name;
        await this.authorizedClientManager.save(<AuthorizedClient>{
            clientRegistration,
            principalName,
            accessToken: tokenResponse.accessToken,
            refreshToken: tokenResponse.refreshToken
        }, principalName);
        const savedRequest = await this.requestCache.get();
        await this.redirectStrategy.send(savedRequest?.redirectUrl || authorizationRequest.redirectUri);
    }

    protected async matchesAuthorizationResponse() {
        if (!AuthorizationResponseUtil.isAuthorizationResponse()) {
            return false;
        }
        const authorizationRequest = await this.authorizationRequestManager.get();
        if (authorizationRequest) {
            return true;
        }
        return !await this.requestMatcher.match(await this.pathResolver.resolve(this.redirectLoginPath));
    }

    readonly priority: number = AUTHORIZATION_CODE_GRANT_MIDDLEWARE_PRIORITY;

}
