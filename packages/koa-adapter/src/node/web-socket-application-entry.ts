import { container } from '@malagu/core/lib/common/container/dynamic-container';
import { Application, ContainerProvider, PathResolver, ConfigProvider } from '@malagu/core';
import { Dispatcher, WebSocketContext, Context, Request, Response, HttpContext } from '@malagu/core/lib/node';
import * as Koa from 'koa';
import * as route from 'koa-route';
import * as websockify from 'koa-websocket';
import { DEFAULT_SERVER_OPTIONS } from './context';

container.then(async c => {
    ContainerProvider.set(c);
    await c.get<Application>(Application).start();
    const configProvider = c.get<ConfigProvider>(ConfigProvider);
    const pathResolver = c.get<PathResolver>(PathResolver);

    const { port, wsOptions, httpsOptions  } = configProvider.get<any>('malagu.server', DEFAULT_SERVER_OPTIONS);
    const { path } = configProvider.get<any>('malagu.rpc');

    const app = websockify(new Koa(), wsOptions, httpsOptions);

    app.ws.use(route.post(await pathResolver.resolve(path), ctx => {
        const dispatcher = c.get<Dispatcher<WebSocketContext>>(Dispatcher);
        if (app.ws.server) {
            new WebSocketContext(ctx.request as unknown as Request, ctx.response as unknown as Response, app.ws.server, ctx.websocket, dispatcher);
        }
    }));

    app.use(route.all(await pathResolver.resolve(), ctx => {
        const dispatcher = c.get<Dispatcher<HttpContext>>(Dispatcher);
        const httpContext = new HttpContext(ctx.request as unknown as Request, ctx.response as unknown as Response);
        Context.run(() => dispatcher.dispatch(httpContext));
    }));

    app.listen(port);
});
