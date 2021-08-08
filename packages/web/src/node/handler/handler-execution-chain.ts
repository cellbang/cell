import { compose, Middleware } from '../middleware';
import { Component } from '@malagu/core';
import { Context } from '../context';
import { HandlerExecutionChain } from './handler-protocol';

@Component(HandlerExecutionChain)
export class HandlerExecutionChainImpl implements HandlerExecutionChain {

    execute(middlewares: Middleware[], next: () => Promise<void>): Promise<void> {
        const middleware = compose(middlewares);
        return middleware(Context.getCurrent(), {
            handle: () => next(),
            priority: 0
        });
    }

}
