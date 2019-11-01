import { StrOrRegex } from '../annotation';
import { ErrorType } from '@malagu/core';

export const MVC_HANDLER_ADAPTER_PRIORITY = 1900;

export interface Route {
    mapping: Map<string, Map<StrOrRegex, any>>;
    errorMapping: Map<ErrorType, any>;
}
