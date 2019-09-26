import { Middleware } from '../middleware';

export const HandlerExecutionChain = Symbol('HandlerExecutionChain');

export const HandlerAdapter = Symbol('HandlerAdapter');

export const HandlerMapping = Symbol('HandlerMapping');

export const RPC_HANDLER_ADAPTER_PRIORITY = 2000;
export const MVC_HANDLER_ADAPTER_PRIORITY = RPC_HANDLER_ADAPTER_PRIORITY - 100;

export interface HandlerExecutionChain {
    execute(handler: HandlerAdapter, middlewares: Middleware[]): Promise<void>;
}

export interface HandlerAdapter {
    readonly priority: number;
    handle(): Promise<void>;
    canHandle(): Promise<boolean>;
}

export interface HandlerMapping {
    getHandler(): Promise<HandlerAdapter>;
}
