import { Context } from './context';
import { Prioritizeable } from '../../common/prioritizeable';
import { ChannelManager } from './channel-manager';
import { Component, Autowired } from '../../common/annotation';
import { injectable } from 'inversify';
import { HttpError } from '../error/http-error';

export const ErrorHandler = Symbol('ErrorHandler');

export const DEFALUT_ERROR_HANDlER_PRIORITY = 500;

export interface ErrorHandler {
    readonly priority: number;
    canHandle(ctx: Context, err: Error): Promise<boolean>;
    handle(ctx: Context, err: Error): Promise<void>;
}

@injectable()
export abstract class AbstractErrorHandler implements ErrorHandler {
    readonly priority: number = DEFALUT_ERROR_HANDlER_PRIORITY;

    @Autowired
    protected readonly channelManager: ChannelManager;

    canHandle(ctx: Context, err: Error): Promise<boolean> {
        return Promise.resolve(true);
    }

    async handle(ctx: Context, err: Error): Promise<void> {
        console.error(err);
        await ctx.handleError(err);
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
    readonly priority: number = DEFALUT_ERROR_HANDlER_PRIORITY + 100;

    canHandle(ctx: Context, err: Error): Promise<boolean> {
        return Promise.resolve(err instanceof HttpError);
    }

    async handle(ctx: Context, err: HttpError): Promise<void> {
        ctx.response.statusCode = err.statusCode;
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
