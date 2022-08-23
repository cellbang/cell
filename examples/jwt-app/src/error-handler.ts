import { AuthenticationError } from './error';
import { ErrorHandler, Context, RedirectStrategy } from '@malagu/web/lib/node';
import { Component, Autowired } from '@malagu/core';
import { HttpStatus, HttpHeaders, XML_HTTP_REQUEST } from '@malagu/web';

@Component(ErrorHandler)
export class AuthenticationErrorHandler implements ErrorHandler {
    readonly priority: number = 500;

    @Autowired(RedirectStrategy)
    protected readonly redirectStrategy: RedirectStrategy;

    canHandle(ctx: Context, err: Error): Promise<boolean> {
        return Promise.resolve(err instanceof AuthenticationError);
    }

    async handle(ctx: Context, err: AuthenticationError): Promise<void> {
        if (ctx.request.get(HttpHeaders.X_REQUESTED_WITH) !== XML_HTTP_REQUEST) {
            await this.redirectStrategy.send('/login');
            ctx.response.end(err.message);
        } else {
            ctx.response.statusCode = HttpStatus.UNAUTHORIZED;
            ctx.response.end(err.message);
        }
    }
}