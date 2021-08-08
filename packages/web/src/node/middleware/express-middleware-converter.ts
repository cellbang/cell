import { Context } from '../context';
import { Middleware } from './middleware-provider';

export function convertExpressMiddleware(expressMiddleware: any): Middleware {

    return {
        handle: (c: Context, next: () => Promise<void>) => new Promise<void>((resolve, reject) => expressMiddleware(c.request, c.response, Context.bind((err: any) => {
            if (err) {
                reject(err);
            } else {
                next().then(resolve).catch(reject);
            }
        }))),
        priority: 0
    };
}

export function linkNext(next: () => Promise<void>): Middleware {
    return {
        handle: () => next(),
        priority: 0
    };
}
