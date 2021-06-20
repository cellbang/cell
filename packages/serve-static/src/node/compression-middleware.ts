import { Middleware, Context } from '@malagu/web/lib/node';
import { Value, Component } from '@malagu/core';
import { HTTP_MIDDLEWARE_PRIORITY } from '@malagu/web/lib/node';

import * as compression from 'compression';

@Component(Middleware)
export class ServeCompression implements Middleware {

    @Value('malagu["serve-static"]')
    protected config: { compressionOtps: compression.CompressionOptions };

    async handle(ctx: Context, next: () => Promise<void>): Promise<void> {
        const executor = (resolve: any, reject: any) => {
            console.log('<<<<1', 'd111111');
            compression(this.config)(ctx.request as any, ctx.response as any, (err: any) => {
                if (err) {
                    reject(err);
                } else {
                    next().then(resolve).catch(reject);
                }
            });
        };

        return new Promise(executor);
    }
    priority = HTTP_MIDDLEWARE_PRIORITY + 800;
}
