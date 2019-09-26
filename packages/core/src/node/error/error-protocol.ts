import { Context } from '../context';

export const ErrorHandler = Symbol('ErrorHandler');

export const DEFALUT_ERROR_HANDlER_PRIORITY = 500;
export const HTTP_ERROR_HANDlER_PRIORITY = DEFALUT_ERROR_HANDlER_PRIORITY + 100;

export interface ErrorHandler {
    readonly priority: number;
    canHandle(ctx: Context, err: Error): Promise<boolean>;
    handle(ctx: Context, err: Error): Promise<void>;
}
