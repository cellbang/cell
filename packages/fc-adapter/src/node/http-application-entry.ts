import { container } from '@malagu/core/lib/common/container/dynamic-container';
import { Application } from '@malagu/core/lib/common/application/application-protocol';
import { ContainerProvider } from '@malagu/core/lib/common/container/container-provider';
import { Dispatcher } from '@malagu/web/lib/node/dispatcher/dispatcher-protocol';
import { Context, HttpContext } from '@malagu/web/lib/node/context';
import * as express from 'express';

container.then(async c => {
    ContainerProvider.set(c);
    await c.get<Application>(Application).start();

    const app = express();
    app.use(express.json());
    app.use(express.raw());
    app.use(express.text());
    app.use(express.urlencoded({ extended: true }));

    app.all('*', async (req: any, res: any) => {
        process.env.ALIBABA_ACCOUNT_ID = req.get('x-fc-account-id');
        process.env.ALIBABA_ACCESS_KEY_ID = req.get('x-fc-access-key-id');
        process.env.ALIBABA_ACCESS_KEY_SECRET = req.get('x-fc-access-key-secret');
        process.env.ALIBABA_SECURITY_TOKEN = req.get('x-fc-security-token');
        process.env.ALIBABA_REQUEST_ID = req.get('x-fc-request-id');
        process.env.ALIBABA_REGION = req.get('x-fc-region');
        const dispatcher = c.get<Dispatcher<HttpContext>>(Dispatcher);
        const httpContext = new HttpContext(req, res);
        Context.run(() => dispatcher.dispatch(httpContext));
    });
    const server = app.listen(9000);
    server.timeout = 0;
    server.keepAliveTimeout = 0;
    console.log('serve 9000');
});
