import { Autowired, Component, Prioritizeable } from '@malagu/core';
import { HandlerMapping, HandlerAdapter } from './handler-protocol';
import { NotFoundError } from '../error';
import { NotFoundAndContinueError } from '../error';
import { Context } from '../context';

@Component(HandlerMapping)
export class HandlerMappingImpl implements HandlerMapping {

    protected prioritized: HandlerAdapter[];

    constructor(
        @Autowired(HandlerAdapter)
        protected readonly handlerAdapters: HandlerAdapter[]
    ) {
        this.prioritized = Prioritizeable.prioritizeAllSync(this.handlerAdapters).map(c => c.value);
    }

    async handle(): Promise<void> {
        let lastError;
        for (const handler of this.prioritized) {
            if (await handler.canHandle()) {
                try {
                    await handler.handle();
                    return;
                } catch (error) {
                    if (error instanceof NotFoundAndContinueError) {
                        lastError = error;
                    } else {
                        throw error;
                    }
                }
            }
        }
        if (lastError) {
            throw lastError;
        }
        throw new NotFoundError(`Not found a suitable handler adapter: ${ Context.getRequest().path }`);
    }

}
