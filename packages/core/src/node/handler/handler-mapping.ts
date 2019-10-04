import { Autowired, Component, Prioritizeable } from '../../common';
import { HandlerMapping, HandlerAdapter } from './handler-protocol';
import { HttpError } from '../error';

@Component(HandlerMapping)
export class HandlerMappingImpl implements HandlerMapping {

    protected prioritized: HandlerAdapter[];

    constructor(
        @Autowired(HandlerAdapter)
        protected readonly handlerAdapters: HandlerAdapter[]
    ) {
        this.prioritized = Prioritizeable.prioritizeAllSync(this.handlerAdapters).map(c => c.value);
    }

    async getHandler(): Promise<HandlerAdapter> {
        for (const handler of this.prioritized) {
            if (await handler.canHandle()) {
                return handler;
            }
        }
        throw new HttpError(404, 'Not found a suitable handler adapter');
    }

}
