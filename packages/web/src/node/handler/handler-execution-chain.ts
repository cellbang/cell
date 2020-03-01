import { compose, Middleware } from '../middleware';
import { Component, Autowired } from '@malagu/core';
import { Context } from '../context';
import { HandlerExecutionChain, HandlerMapping } from './handler-protocol';

@Component(HandlerExecutionChain)
export class HandlerExecutionChainImpl implements HandlerExecutionChain {

    @Autowired(HandlerMapping)
    protected readonly handlerMapping: HandlerMapping;

    execute(middlewares: Middleware[]): Promise<void> {
        const middleware = compose(middlewares);
        return middleware(Context.getCurrent(), {
            handle: (c: Context, next: () => Promise<void>) => this.handlerMapping.handle(),
            priority: 0
        });
    }

}
