import { Context } from '../context';
import { Component, Autowired, Prioritizeable, Injectable } from '@malagu/core';
import { ErrorHandler, DEFALUT_ERROR_HANDLER_PRIORITY, HTTP_ERROR_HANDLER_PRIORITY, VALIDATION_ERRORS_ERROR_HANDLER_PRIORITY } from './error-protocol';
import { HttpError } from './http-error';
import { HttpStatus } from '../../common/http';
import { ValidationErrors } from '../../common/pipe';

@Injectable()
export abstract class AbstractErrorHandler implements ErrorHandler {
    readonly priority: number = DEFALUT_ERROR_HANDLER_PRIORITY;

    canHandle(ctx: Context, err: Error): Promise<boolean> {
        return Promise.resolve(true);
    }

    async handle(ctx: Context, err: Error): Promise<void> {
        console.error(err);
        ctx.response.statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
        ctx.response.end(err.message);
        await this.doHandle(ctx, err);
    }

    doHandle(ctx: Context, err: Error): Promise<void> {
        return Promise.resolve();
    }
}

@Component(ErrorHandler)
export class DefaultErrorHandler extends AbstractErrorHandler {
}

@Component(ErrorHandler)
export class HttpErrorHandler implements ErrorHandler {
    readonly priority: number = HTTP_ERROR_HANDLER_PRIORITY;

    canHandle(ctx: Context, err: Error): Promise<boolean> {
        return Promise.resolve(err instanceof HttpError);
    }

    async handle(ctx: Context, err: HttpError): Promise<void> {
        ctx.response.statusCode = err.statusCode;
        ctx.response.end(err.message);
    }
}

@Component(ErrorHandler)
export class ValidationErrorsHandler implements ErrorHandler {
    readonly priority: number = VALIDATION_ERRORS_ERROR_HANDLER_PRIORITY;

    canHandle(ctx: Context, err: Error): Promise<boolean> {
        return Promise.resolve(err instanceof ValidationErrors);
    }

    async handle(ctx: Context, err: HttpError): Promise<void> {
        ctx.response.statusCode = HttpStatus.BAD_REQUEST;
        ctx.response.end(err.message);
    }
}

@Component()
export class ErrorHandlerProvider {

    protected prioritized: ErrorHandler[];

    constructor(
        @Autowired(ErrorHandler)
        protected readonly handlers: ErrorHandler[]
    ) { }

    provide(): ErrorHandler[] {
        if (!this.prioritized) {
            this.prioritized = Prioritizeable.prioritizeAllSync(this.handlers).map(c => c.value);
        }
        return this.prioritized;
    }

}
