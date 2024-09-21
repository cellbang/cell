import { container } from '@celljs/core/lib/common/container/dynamic-container';
import { Application } from '@celljs/core/lib/common/application/application-protocol';
import { ContainerProvider } from '@celljs/core/lib/common/container/container-provider';
import { Dispatcher } from '@celljs/web/lib/node/dispatcher/dispatcher-protocol';
import { Context } from '@celljs/web/lib/node/context';
import * as express from 'express';

const app = express();

const port = 9000;

async function bootstrap() {
    try {
        const c = await container;
        ContainerProvider.set(c);
        await c.get<Application>(Application).start();
        app.all('*', async (req: any, res: any) => {
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
