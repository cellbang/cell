import { container } from '@malagu/core/lib/common/container/dynamic-container';
import { Dispatcher, Context, HttpContext } from '@malagu/web/lib/node';
import * as express from 'express';
import { ContainerProvider, Application } from '@malagu/core';

container.then(async c => {
    ContainerProvider.set(c);
    await c.get<Application>(Application).start();

    const app = express();
    app.use(express.json());
    app.use(express.raw());
    app.use(express.text());
    app.all('*', async (req: any, res: any) => {
        const dispatcher = c.get<Dispatcher<HttpContext>>(Dispatcher);
        const httpContext = new HttpContext(req, res);
        Context.run(() => dispatcher.dispatch(httpContext));
    });
    const server = app.listen(9000);
    server.timeout = 0;
    server.keepAliveTimeout = 0;
    console.log('serve 9000');
});
