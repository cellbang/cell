import { Dispatcher, Context, HttpContext, Response, Request } from '@malagu/core/lib/node';
import * as Koa from 'koa';
import * as route from 'koa-route';
import { ConfigProvider } from '@malagu/core/lib/common/config-provider';
import { DEFAULT_SERVER_OPTIONS } from './context';
import { ContainerProvider, container } from '@malagu/core/lib/common';
import { Application } from '@malagu/core/lib/common/application-protocol';

container.then(async c => {
    ContainerProvider.set(c);
    await c.get<Application>(Application).start();
    const configProvider = c.get<ConfigProvider>(ConfigProvider);
    const { port } = configProvider.get<any>('server', DEFAULT_SERVER_OPTIONS);
    const rootPath = configProvider.get<string>('rootPath');
    const app = new Koa();

    app.use(route.all(rootPath, ctx => {
        const dispatcher = c.get<Dispatcher<HttpContext>>(Dispatcher);
        const httpContext = new HttpContext(ctx.request as unknown as Request, ctx.response as unknown as Response);
        Context.run(() => dispatcher.dispatch(httpContext));
    }));

    app.listen(port);
});
