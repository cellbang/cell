import { Middleware, Context } from '@malagu/web/lib/node';
import * as serveStatic from 'serve-static';
import { Value, Component } from '@malagu/core';
import { HTTP_MIDDLEWARE_PRIORITY } from '@malagu/web/lib/node';
import { SERVER_PATH } from '@malagu/web';
import { relative } from 'path';

@Component(Middleware)
export class ServeStaticMiddleware implements Middleware {

    @Value('malagu["serve-static"]')
    protected config: { spa: boolean, root: string, options: any };

    @Value(SERVER_PATH)
    protected path: string;

    handle(ctx: Context, next: () => Promise<void>): Promise<void> {
        const oldUrl = ctx.request.url;
        if (this.path && this.path !== ctx.request.url) {
            ctx.request.url = relative(this.path, ctx.request.url);
        }

        const executor = (resolve: any, reject: any) => {
            serveStatic(this.config.root, this.config.options)(ctx.request as any, ctx.response as any, (err: any) => {
                const url = ctx.request.url;
                if ((ctx.request.method === 'GET' || ctx.request.method === 'HEAD') && url !== 'index.html') {
                    ctx.request.url = '/index.html';
                    executor(resolve, reject);
                } else if (err) {
                    ctx.request.url = oldUrl;
                    reject(err);
                } else {
                    ctx.request.url = oldUrl;
                    next().then(resolve).catch(reject);
                }
            });
        };

        return new Promise(executor);
    }
    priority = HTTP_MIDDLEWARE_PRIORITY + 500;

}
