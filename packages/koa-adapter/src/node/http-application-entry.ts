import { container } from '@malagu/core/lib/common/dynamic-container';
import { Dispatcher, Context } from '@malagu/core/lib/node';
import * as Koa from 'koa';
import * as route from 'koa-route';
import { ConfigProvider } from '@malagu/core/lib/common/config-provider';
import { HttpContext, DEFAULT_SERVER_OPTIONS } from './context';
import { ContainerProvider } from '@malagu/core';

container.then(c => {
    ContainerProvider.set(c);
    const configProvider = c.get<ConfigProvider>(ConfigProvider);
    const { port, path  } = configProvider.get<any>('server', DEFAULT_SERVER_OPTIONS);
    const app = new Koa();

    app.use(route.all(path, ctx => {
        const dispatcher = c.get<Dispatcher<HttpContext>>(Dispatcher);
        const httpContext = new HttpContext(ctx);
        Context.run(() => dispatcher.dispatch(httpContext));
    }));

    app.listen(port);
});
