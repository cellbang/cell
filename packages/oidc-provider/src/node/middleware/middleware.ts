import { Autowired, Component, Value } from '@malagu/core';
import { Context, Middleware, RequestMatcher } from '@malagu/web/lib/node';
import { OIDC_MIDDLEWARE_PRIORITY } from './middleware-protocol';
import { PathResolver } from '@malagu/web';
import { OidcProvider } from '../oidc';
import { IncomingMessage, ServerResponse } from 'http';
import { Http2ServerRequest, Http2ServerResponse } from 'http2';

@Component(Middleware)
export class OidcMiddleware implements Middleware {

    @Value('malagu["odic-provider"].path')
    protected readonly path: string;

    @Autowired(RequestMatcher)
    protected readonly requestMatcher: RequestMatcher;

    @Autowired(PathResolver)
    protected readonly pathResolver: PathResolver;

    @Autowired(OidcProvider)
    protected readonly oidcProvider: OidcProvider;

    protected callback: (req: IncomingMessage | Http2ServerRequest, res: ServerResponse | Http2ServerResponse) => void;

    async handle(ctx: Context, next: () => Promise<void>): Promise<void> {
        if (await this.match()) {
            const oidc = await this.oidcProvider.get();
            if (!this.callback) {
                this.callback = oidc.callback();
            }
            this.callback(ctx.request, ctx.response);
            return;
        }
        await next();
    }

    protected async match() {
        return !!await this.requestMatcher.match(await this.pathResolver.resolve(this.path));
    }

    priority = OIDC_MIDDLEWARE_PRIORITY;

}
