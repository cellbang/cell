import { Middleware } from '../middleware';

export const HandlerExecutionChain = Symbol('HandlerExecutionChain');

export const HandlerAdapter = Symbol('HandlerAdapter');

export const HandlerMapping = Symbol('HandlerMapping');

export interface HandlerExecutionChain {
    execute(middlewares: Middleware[]): Promise<void>;
}

export interface HandlerAdapter {
    readonly priority: number;
    handle(): Promise<void>;
    canHandle(): Promise<boolean>;
}

export interface HandlerMapping {
    handle(): Promise<void>;
}
