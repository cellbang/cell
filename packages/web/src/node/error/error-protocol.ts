import { Context } from '../context';

export const ErrorHandler = Symbol('ErrorHandler');

export const DEFALUT_ERROR_HANDLER_PRIORITY = 1;
export const HTTP_ERROR_HANDLER_PRIORITY = DEFALUT_ERROR_HANDLER_PRIORITY + 100;
export const VALIDATION_ERRORS_ERROR_HANDLER_PRIORITY = HTTP_ERROR_HANDLER_PRIORITY + 100;

export interface ErrorHandler {
    /**
     * The priority value must be greater than the default Error Handler's priority: DEFALUT_ERROR_HANDLER_PRIORITY, otherwise it will never be executed.
     */
    readonly priority: number;
    canHandle(ctx: Context, err: Error): Promise<boolean>;
    handle(ctx: Context, err: Error): Promise<void>;
}
