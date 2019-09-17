import { Context } from '../context';

export const Dispatcher = Symbol('Dispatcher');

export interface Dispatcher<T extends Context> {
    dispatch(ctx: T): Promise<void>;
}
