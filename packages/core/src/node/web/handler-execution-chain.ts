import { HandlerExecutionChain, HandlerAdapter } from './dispatcher-protocol';
import { compose, Middleware } from '../middleware';
import { Component } from '../../common/annotation';
import { Context } from './context';

@Component(HandlerExecutionChain)
export class HandlerExecutionChainImpl implements HandlerExecutionChain {

    execute(handler: HandlerAdapter, middlewares: Middleware[]): Promise<void> {
        const middleware = compose(middlewares);
        return middleware(Context.getCurrent(), {
            handle: (c: Context, next: () => Promise<void>) => handler.handle(),
            priority: 0
        });
    }

}
