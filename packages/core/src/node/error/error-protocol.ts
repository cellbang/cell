import { Context } from '../context';
import { CustomError } from './cutom-error';
import { Newable, Abstract } from '../../common';

export const ErrorHandler = Symbol('ErrorHandler');

export const DEFALUT_ERROR_HANDlER_PRIORITY = 500;
export const HTTP_ERROR_HANDlER_PRIORITY = DEFALUT_ERROR_HANDlER_PRIORITY + 100;

export type ErrorType = Newable<CustomError> | Abstract<CustomError>;

export interface ErrorHandler {
    readonly priority: number;
    canHandle(ctx: Context, err: Error): Promise<boolean>;
    handle(ctx: Context, err: Error): Promise<void>;
}
