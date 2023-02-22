import { Middleware, Context, RequestMatcher, HttpError, RedirectStrategy } from '@malagu/web/lib/node';
import { Component, Value, Autowired, Logger } from '@malagu/core';
import { AUTHORIZATION_REQUEST_BASE_URI } from '../constants';
import { AuthorizationRequestResolver, AuthorizationRequestManager, AUTHORIZATION_REQUEST_REDIRECT_MIDDLEWARE_PRIORITY } from './authorization-protocol';
import { AuthorizationGrantType, AuthorizationRequest } from '@malagu/oauth2-core';
import { HttpMethod, HttpStatus } from '@malagu/web';
import { ClientAuthorizationError } from '../error';
import { RequestCache } from '@malagu/security/lib/node';

@Component(Middleware)
export class AuthorizationRequestRedirectMiddleware implements Middleware {

    @Value(AUTHORIZATION_REQUEST_BASE_URI)
    protected readonly authorizationRequestBaseUri: string;

    @Autowired(RequestMatcher)
    protected readonly requestMatcher: RequestMatcher;

    @Autowired(AuthorizationRequestManager)
    protected readonly authorizationRequestManager: AuthorizationRequestManager<AuthorizationRequest>;

    @Autowired(AuthorizationRequestResolver)
    protected readonly authorizationRequestResolver: AuthorizationRequestResolver;

    @Autowired(RedirectStrategy)
    protected readonly redirectStrategy: RedirectStrategy;

    @Autowired(RequestCache)
    protected readonly requestCache: RequestCache;

    @Value('malagu.security.targetUrlParameter')
    protected readonly targetUrlParameter: string;

    @Autowired(Logger)
    protected readonly logger: Logger;

    async handle(ctx: Context, next: () => Promise<void>): Promise<void> {
        try {
            const authorizationRequest = await this.authorizationRequestResolver.resolve();
            if (authorizationRequest) {
                await this.sendRedirectForAuthorization(authorizationRequest);
                return;
            }
        } catch (error) {
            this.unsuccessfulRedirectForAuthorization(error);
        }
        try {
            await next();
        } catch (err) {
            if (err instanceof ClientAuthorizationError) {
                try {
                    const authorizationRequest = await this.authorizationRequestResolver.resolve(err.clientRegistrationId);
                    if (authorizationRequest) {
                        await this.sendRedirectForAuthorization(authorizationRequest);
                        await this.requestCache.save();
                        return;
                    }
                } catch (error) {
                    this.unsuccessfulRedirectForAuthorization(error);
                }
            }

            throw err;
        }

    }
    protected unsuccessfulRedirectForAuthorization(error: any) {
        this.logger.error(`Authorization Request failed: ${error}`);
        throw new HttpError(HttpStatus.INTERNAL_SERVER_ERROR, HttpStatus.INTERNAL_SERVER_ERROR_REASON_PHRASE);
    }

    protected async sendRedirectForAuthorization(authorizationRequest: AuthorizationRequest) {
        if (AuthorizationGrantType.AuthorizationCode === authorizationRequest.authorizationGrantType) {
            await this.authorizationRequestManager.save(authorizationRequest);
        }
        if (this.targetUrlParameter) {
            const redirectUrl = <string>Context.getRequest().query[this.targetUrlParameter];
            if (redirectUrl) {
                await this.requestCache.save({
                    redirectUrl,
                    method: HttpMethod.GET,
                    query: {}
                });
            }
        }
        await this.redirectStrategy.send(authorizationRequest.authorizationRequestUri);
    }

    readonly priority: number = AUTHORIZATION_REQUEST_REDIRECT_MIDDLEWARE_PRIORITY;

}
