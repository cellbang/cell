import { container } from '@malagu/core/lib/common/container/dynamic-container';
import { Dispatcher, Context, HttpContext } from '@malagu/web/lib/node';
import * as express from 'express';
import { DEFAULT_SERVER_OPTIONS } from './context';
import { ContainerProvider, Application, ConfigProvider } from '@malagu/core';

container.then(async c => {
    ContainerProvider.set(c);
    await c.get<Application>(Application).start();
    const configProvider = c.get<ConfigProvider>(ConfigProvider);
    const { port } = configProvider.get<any>('malagu.server', DEFAULT_SERVER_OPTIONS);

    const app = express();
    app.use(express.json());
    app.use(express.raw());
    app.use(express.text());
    app.all('*', async (req: any, res: any) => {
        const dispatcher = c.get<Dispatcher<HttpContext>>(Dispatcher);
        const httpContext = new HttpContext(req, res);
        Context.run(() => dispatcher.dispatch(httpContext));
    });
    app.listen(port);
    console.log(`serve ${port}`);
});
