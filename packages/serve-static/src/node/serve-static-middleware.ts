import { Middleware, Context, RequestMatcher } from '@malagu/web/lib/node';
import * as serveStatic from 'serve-static';
import { Value, Component, Autowired } from '@malagu/core';
import { HTTP_MIDDLEWARE_PRIORITY } from '@malagu/web/lib/node';
import { SERVER_PATH } from '@malagu/web';
import { relative } from 'path';
import { OutgoingMessage } from 'http';

@Component(Middleware)
export class ServeStaticMiddleware implements Middleware {

    @Value('malagu["serve-static"]')
    protected config: { spa: boolean, root: string, path: string, apiPath: string, options: any };

    @Value(SERVER_PATH)
    protected path: string;

    @Autowired(RequestMatcher)
    protected readonly requestMatcher: RequestMatcher;

    handle(ctx: Context, next: () => Promise<void>): Promise<void> {
        const oldUrl = ctx.request.url;
        if (this.path && this.path !== ctx.request.url) {
            ctx.request.url = relative(this.path, ctx.request.url);
        }

        const executor = (resolve: any, reject: any) => {
            const opts = this.config.options;
            if (!opts.setHeaders) {
                opts.setHeaders = (res: OutgoingMessage, path: string) => {
                    if ((serveStatic.mime as any).lookup!(path) === 'text/html') {
                        // Custom Cache-Control for HTML files
                        res.setHeader('Cache-Control', `public, max-age=${opts.htmlMaxAge / 1000}`);
                    }
                };
            }
            serveStatic(this.config.root, this.config.options)(ctx.request as any, ctx.response as any, (err: any) => {
                const url = ctx.request.url;
                if ((ctx.request.method === 'GET' || ctx.request.method === 'HEAD') && url !== 'index.html') {
                    if (this.config.path && !this.requestMatcher.match(this.config.path)) {
                        ctx.request.url = oldUrl;
                        next().then(resolve).catch(reject);
                    }
                    if (this.config.apiPath && this.requestMatcher.match(this.config.apiPath)) {
                        ctx.request.url = oldUrl;
                        next().then(resolve).catch(reject);
                    } else {
                        ctx.request.url = '/index.html';
                        executor(resolve, reject);
                    }
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
