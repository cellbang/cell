import { AuthenticationError } from './error';
import { ErrorHandler, Context, RedirectStrategy, DEFALUT_ERROR_HANDLER_PRIORITY } from '@celljs/web/lib/node';
import { Component, Autowired } from '@celljs/core';
import { HttpStatus, HttpHeaders, XML_HTTP_REQUEST } from '@celljs/web';

@Component(ErrorHandler)
export class AuthenticationErrorHandler implements ErrorHandler {

    /**
     * 优先级的值一定要大于默认 Error Handler 的优先级：DEFALUT_ERROR_HANDLER_PRIORITY，否则将永远不会被执行.
     */
    readonly priority: number = DEFALUT_ERROR_HANDLER_PRIORITY + 100;

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