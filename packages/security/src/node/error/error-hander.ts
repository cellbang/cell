import { AUTHENTICATION_ERROR_HANDlER_PRIORITY, ACCESS_DENIED_ERROR_HANDlER_PRIORITY } from './error-protocol';
import { AuthenticationError, AccessDeniedError } from './error';
import { ErrorHandler, Context, RedirectStrategy } from '@malagu/web/lib/node';
import { Component, Value, Autowired } from '@malagu/core';
import { HttpStatus, HttpHeaders, XML_HTTP_REQUEST } from '@malagu/web';
import { RequestCache } from '../cache';

@Component([AuthenticationErrorHandler, ErrorHandler])
export class AuthenticationErrorHandler implements ErrorHandler {
    readonly priority: number = AUTHENTICATION_ERROR_HANDlER_PRIORITY;

    @Value('malagu.security.basic.realm')
    protected realm: string;

    @Value('malagu.security.basic.enabled')
    protected readonly baseEnabled: boolean;

    @Value('malagu.security.loginPage')
    protected loginPage: string;

    @Autowired(RedirectStrategy)
    protected readonly redirectStrategy: RedirectStrategy;

    @Autowired(RequestCache)
    protected readonly requestCache: RequestCache;

    canHandle(ctx: Context, err: Error): Promise<boolean> {
        return Promise.resolve(err instanceof AuthenticationError);
    }

    async handle(ctx: Context, err: AuthenticationError): Promise<void> {
        if (ctx.request.get(HttpHeaders.X_REQUESTED_WITH) !== XML_HTTP_REQUEST && !this.baseEnabled) {
            await this.requestCache.save();
            await this.redirectStrategy.send(this.loginPage);
        } else {
            if (this.baseEnabled) {
                ctx.response.setHeader(HttpHeaders.WWW_AUTHENTICATE, `Basic realm="${this.realm}"`);
            }
            ctx.response.statusCode = HttpStatus.UNAUTHORIZED;
            ctx.response.end(HttpStatus.UNAUTHORIZED_REASON_PHRASE);
        }
    }
}

@Component(ErrorHandler)
export class AccessDeniedErrorHandler implements ErrorHandler {
    readonly priority: number = ACCESS_DENIED_ERROR_HANDlER_PRIORITY;

    canHandle(ctx: Context, err: Error): Promise<boolean> {
        return Promise.resolve(err instanceof AccessDeniedError);
    }

    async handle(ctx: Context, err: AccessDeniedError): Promise<void> {
        ctx.response.statusCode = HttpStatus.FORBIDDEN;
        ctx.response.end(HttpStatus.FORBIDDEN_REASON_PHRASE);
    }
}
