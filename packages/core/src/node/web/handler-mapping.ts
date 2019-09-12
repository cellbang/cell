import { HandlerMapping, HandlerAdapter } from './dispatcher-protocol';
import { Autowired, Component } from '../../common/annotation';

@Component(HandlerMapping)
export class HandlerMappingImpl implements HandlerMapping {

    @Autowired(HandlerAdapter)
    protected handlerAdapters: HandlerAdapter[];

    async getHandler(): Promise<HandlerAdapter> {
        for (const handler of this.handlerAdapters) {
            if (await handler.canHandle()) {
                return handler;
            }
        }
        throw new Error('Not found a suitable handler.');
    }

}
