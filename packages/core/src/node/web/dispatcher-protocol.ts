import { Context } from './context';
import { Middleware } from '../middleware';

export const Dispatcher = Symbol('Dispatcher');

export const HandlerExecutionChain = Symbol('HandlerExecutionChain');

export const DispatcHandlerAdapterher = Symbol('HandlerAdapter');

export const HandlerAdapter = Symbol('HandlerAdapter');

export const HandlerMapping = Symbol('HandlerMapping');

export interface Dispatcher<T extends Context> {
    dispatch(ctx: T): Promise<void>;
}

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
