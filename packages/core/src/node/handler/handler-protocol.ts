import { Middleware } from '../middleware';

export const HandlerExecutionChain = Symbol('HandlerExecutionChain');

export const HandlerAdapter = Symbol('HandlerAdapter');

export const HandlerMapping = Symbol('HandlerMapping');

export interface HandlerExecutionChain {
    execute(handler: HandlerAdapter, middlewares: Middleware[]): Promise<void>;
}

export interface HandlerAdapter {
    handle(): Promise<void>;
    canHandle(): Promise<boolean>;
}

export interface HandlerMapping {
    getHandler(): Promise<HandlerAdapter>
}
