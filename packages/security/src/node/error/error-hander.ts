import { AUTHENTICATION_ERROR_HANDlER_PRIORITY, ACCESS_DENIED_ERROR_HANDlER_PRIORITY } from './error-protocol';
import { AuthenticationError, AccessDeniedError } from './error';
import { ErrorHandler, Context } from '@malagu/core/lib/node';
import { Component } from '@malagu/core';

@Component(ErrorHandler)
export class AuthenticationErrorHandler implements ErrorHandler {
    readonly priority: number = AUTHENTICATION_ERROR_HANDlER_PRIORITY;

    canHandle(ctx: Context, err: Error): Promise<boolean> {
        return Promise.resolve(err instanceof AuthenticationError);
    }

    async handle(ctx: Context, err: AuthenticationError): Promise<void> {
        ctx.response.statusCode = 401;
        ctx.response.end(err.message);
    }
}

@Component(ErrorHandler)
export class AccessDeniedErrorHandler implements ErrorHandler {
    readonly priority: number = ACCESS_DENIED_ERROR_HANDlER_PRIORITY;

    canHandle(ctx: Context, err: Error): Promise<boolean> {
        return Promise.resolve(err instanceof AccessDeniedError);
    }

    async handle(ctx: Context, err: AccessDeniedError): Promise<void> {
        ctx.response.statusCode = 403;
        ctx.response.end(err.message);
    }
}
