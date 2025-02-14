import { OAUTH2_AUTHORIZATION_ERROR_HANDLER_PRIORITY } from './error-protocol';
import { ErrorHandler, Context, RedirectStrategy } from '@celljs/web/lib/node';
import { Component, Autowired } from '@celljs/core';
import { OAuth2AuthorizationError, AuthorizationRequest, OAuth2ParameterNames } from '@celljs/oauth2-core';
import { AuthorizationRequestManager } from '../authorization';
import { enc } from 'crypto-js';

@Component(ErrorHandler)
export class OAuth2AuthorizationErrorHandler implements ErrorHandler {
    readonly priority: number = OAUTH2_AUTHORIZATION_ERROR_HANDLER_PRIORITY;

    @Autowired(RedirectStrategy)
    protected readonly redirectStrategy: RedirectStrategy;

    @Autowired(AuthorizationRequestManager)
    protected readonly authorizationRequestManager: AuthorizationRequestManager<AuthorizationRequest>;

    canHandle(ctx: Context, err: Error): Promise<boolean> {
        return Promise.resolve(err instanceof OAuth2AuthorizationError);
    }

    async handle(ctx: Context, err: OAuth2AuthorizationError): Promise<void> {
        const { oauth2Error } = err;
        const authorizationRequest = <AuthorizationRequest>await this.authorizationRequestManager.remove();

        let redirectUri = `${authorizationRequest.redirectUri}?${OAuth2ParameterNames.ERROR}=${oauth2Error.errorCode}`;
        if (oauth2Error.description) {
            redirectUri = `${redirectUri}&${OAuth2ParameterNames.ERROR_DESCRIPTION}=${enc.Base64.stringify(enc.Utf8.parse(oauth2Error.description))}`;
        }

        if (oauth2Error.uri) {
            redirectUri = `${redirectUri}&${OAuth2ParameterNames.ERROR_URI}=${enc.Base64.stringify(enc.Utf8.parse(oauth2Error.uri))}`;

        }

        await this.redirectStrategy.send(redirectUri);
        ctx.response.end(err.message);
    }
}
