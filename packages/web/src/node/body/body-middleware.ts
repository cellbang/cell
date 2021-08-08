import { convertExpressMiddleware, Middleware } from '../middleware';
import { Context } from '../context';
import { Component, Autowired, Value } from '@malagu/core';
import { json, text, raw, urlencoded, Options } from 'body-parser';
import { BODY_MIDDLEWARE_PRIORITY } from './body-protocol';
import { HandlerExecutionChain } from '../handler';

@Component(Middleware)
export class BodyMiddleware implements Middleware {

    @Autowired(HandlerExecutionChain)
    protected handlerExecutionChain: HandlerExecutionChain;

    @Value('malagu.web.body')
    protected readonly options: Options;

    async handle(ctx: Context, next: () => Promise<void>): Promise<void> {
        return this.handlerExecutionChain.execute([
            convertExpressMiddleware(json({ ...this.options })),
            convertExpressMiddleware(text({ ...this.options })),
            convertExpressMiddleware(raw({ ...this.options })),
            convertExpressMiddleware(urlencoded({ ...this.options, ...{ extended: true } }))
        ], next);
    }

    readonly priority = BODY_MIDDLEWARE_PRIORITY;

}
