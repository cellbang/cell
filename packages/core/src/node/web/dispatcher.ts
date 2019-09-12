import { Context } from './context';
import { MiddlewareProvider } from '../middleware';
import { ErrorHandlerProvider } from './error-hander-provider';
import { Dispatcher, HandlerMapping, HandlerExecutionChain } from './dispatcher-protocol';
import { Component } from '../../common/annotation/component';
import { Autowired } from '../../common/annotation';

@Component(Dispatcher)
export class DispatcherImpl implements Dispatcher<Context> {
    @Autowired(HandlerMapping)
    protected readonly handlerMapping: HandlerMapping;

    @Autowired(HandlerExecutionChain)
    protected handlerExecutionChain: HandlerExecutionChain;

    @Autowired
    protected middlewareProvider: MiddlewareProvider;

    @Autowired
    protected errorHandlerProvider: ErrorHandlerProvider;

    async dispatch(ctx: Context): Promise<void> {
        try {
            Context.setCurrent(ctx);
            const middlewares = this.middlewareProvider.provide();
            const hander = await this.handlerMapping.getHandler();
            await this.handlerExecutionChain.execute(hander, middlewares);
        } catch (err) {
            await this.handleError(ctx, err);
        }
    }

    protected async handleError(ctx: Context, err: Error): Promise<void> {
        const errorHandlers = this.errorHandlerProvider.provide();
        for (const handler of errorHandlers) {
            if (await handler.canHandle(ctx, err)) {
                try {
                    await handler.handle(ctx, err);
                } catch (error) {
                    continue;
                }
                return;
            }
        }
    }
}
