import { Middleware, Context, RequestMatcher, HTTP_MIDDLEWARE_PRIORITY } from '@malagu/web/lib/node';
import {serveStatic, mime} from './serve-static';
import { Value, Component, Autowired } from '@malagu/core';
import { HttpMethod, MediaType, HttpHeaders } from '@malagu/http';
import { SERVER_PATH } from '@malagu/web';
import { OutgoingMessage } from 'http';
@Component(Middleware)
export class ServeStaticMiddleware implements Middleware {

    @Value('malagu["serve-static"]')
    protected config: { spa: boolean, root: string, path: string, apiPath: string, options: any};

    @Value(SERVER_PATH)
    protected path: string;

    @Autowired(RequestMatcher)
    protected readonly requestMatcher: RequestMatcher;

    async handle(ctx: Context, next: () => Promise<void>): Promise<void> {
        this.config.options.baseHref = this.path;
        const method = ctx.request.method;

        if (!(method === HttpMethod.GET || method === HttpMethod.HEAD) || ctx.request.query['static'] === 'skip') {
            await next();
            return;
        }

        if (this.config.apiPath && await this.requestMatcher.match(this.config.apiPath)) {
            await next();
            return;
        }

        if (this.config.path && !await this.requestMatcher.match(this.config.path)) {
            await next();
            return;
        }

        const executor = (resolve: any, reject: any) => {
            const opts = this.config.options;
            if (!opts.setHeaders) {
                opts.setHeaders = (res: OutgoingMessage, path: string) => {
                    if (opts.headers) {
                        Object.keys(opts.headers).forEach(key => res.setHeader(key, opts.headers[key]));
                    }
                    if ((mime as any).lookup!(path) === MediaType.TEXT_HTML) {
                        // Custom Cache-Control for HTML files
                        res.setHeader(HttpHeaders.CACHE_CONTROL, `public, max-age=${opts.htmlMaxAge / 1000}`);
                    }
                };
            }

            serveStatic(this.config.root, this.config.options)(ctx.request as any, ctx.response as any, ((err: any) => {
                const url = ctx.request.url;
                if (url !== '/index.html') {
                    if (!this.config.spa) {
                        next().then(resolve).catch(reject);
                        return;
                    }
                    ctx.request.url = '/index.html';
                    executor(resolve, reject);
                } else if (err) {
                    reject(err);
                } else {
                    next().then(resolve).catch(reject);
                }
            }) as any);
        };

        return new Promise(executor);
    }
    priority = HTTP_MIDDLEWARE_PRIORITY + 500;

}
