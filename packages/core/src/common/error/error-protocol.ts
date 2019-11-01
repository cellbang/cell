import { CustomError } from './cutom-error';
import { Newable, Abstract } from '../utils';

export const ErrorHandler = Symbol('ErrorHandler');

export const DEFALUT_ERROR_HANDlER_PRIORITY = 500;
export const HTTP_ERROR_HANDlER_PRIORITY = DEFALUT_ERROR_HANDlER_PRIORITY + 100;

export type ErrorType = Newable<CustomError> | Abstract<CustomError>;
