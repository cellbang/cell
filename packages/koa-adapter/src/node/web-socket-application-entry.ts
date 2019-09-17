import { container } from '@malagu/core/lib/common/dynamic-container';
import { Dispatcher, WebSocketContext, Context, Request, Response, HttpContext } from '@malagu/core/lib/node';
import * as Koa from 'koa';
import * as route from 'koa-route';
import * as websockify from 'koa-websocket';
import { ConfigProvider } from '@malagu/core/lib/common/config-provider';
import { DEFAULT_SERVER_OPTIONS } from './context';
import { ContainerProvider } from '@malagu/core/lib/common';
import { Application } from '@malagu/core/lib/common/application-protocol';
const urlJoin = require('url-join');

container.then(async c => {
    ContainerProvider.set(c);
    await c.get<Application>(Application).start();
    const configProvider = c.get<ConfigProvider>(ConfigProvider);
    const { port, wsOptions, httpsOptions  } = configProvider.get<any>('server', DEFAULT_SERVER_OPTIONS);
    const rpcPath = configProvider.get<string>('rpcPath');
    const rootPath = configProvider.get<string>('rootPath');

    const app = websockify(new Koa(), wsOptions, httpsOptions);

    app.ws.use(route.post(urlJoin(rootPath, rpcPath), ctx => {
        const dispatcher = c.get<Dispatcher<WebSocketContext>>(Dispatcher);
        if (app.ws.server) {
            new WebSocketContext(ctx.request as unknown as Request, ctx.response as unknown as Response, app.ws.server, ctx.websocket, dispatcher);
        }
    }));

    app.use(route.all(rootPath, ctx => {
        const dispatcher = c.get<Dispatcher<HttpContext>>(Dispatcher);
        const httpContext = new HttpContext(ctx.request as unknown as Request, ctx.response as unknown as Response);
        Context.run(() => dispatcher.dispatch(httpContext));
    }));

    app.listen(port);
});
