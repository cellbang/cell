import { container } from '@malagu/core/lib/common/container/dynamic-container';
import { Application } from '@malagu/core/lib/common/application/application-protocol';
import { ContainerProvider } from '@malagu/core/lib/common/container/container-provider';
import { Dispatcher } from '@malagu/web/lib/node/dispatcher/dispatcher-protocol';
import { Context } from '@malagu/web/lib/node/context';
import * as express from 'express';

const app = express();

const port = 9000;

async function bootstrap() {
    try {
        const c = await container;
        ContainerProvider.set(c);
        await c.get<Application>(Application).start();
        app.all('*', async (req: any, res: any) => {
            process.env.ALIBABA_ACCOUNT_ID = req.get('x-fc-account-id');
            process.env.ALIBABA_ACCESS_KEY_ID = req.get('x-fc-access-key-id');
            process.env.ALIBABA_ACCESS_KEY_SECRET = req.get('x-fc-access-key-secret');
            process.env.ALIBABA_SECURITY_TOKEN = req.get('x-fc-security-token');
            process.env.ALIBABA_REQUEST_ID = req.get('x-fc-request-id');
            process.env.ALIBABA_REGION = req.get('x-fc-region');
            const dispatcher = c.get<Dispatcher<Context>>(Dispatcher);
            const httpContext = new Context(req, res);
            Context.run(() => dispatcher.dispatch(httpContext));
        });
        const server = app.listen(port, '0.0.0.0');
        server.timeout = 0;
        server.keepAliveTimeout = 0;
        console.log(`serve ${port}`);
    } catch (error) {
        app.all('*', async (req: any, res: any) => {
            res.status = 500;
            res.send(error);
        });
        const server = app.listen(port, '0.0.0.0');
        server.timeout = 0;
        server.keepAliveTimeout = 0;
    }
}

bootstrap();
