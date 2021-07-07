import { container } from '@malagu/core/lib/common/container/dynamic-container';
import { Application } from '@malagu/core/lib/common/application/application-protocol';
import { ContainerProvider } from '@malagu/core/lib/common/container/container-provider';
import { Dispatcher } from '@malagu/web/lib/node/dispatcher/dispatcher-protocol';
import { Context, HttpContext } from '@malagu/web/lib/node/context';
import { FaaSEventListener } from '@malagu/faas-adapter/lib/node/event/event-protocol';
import * as express from 'express';
const { createServer, proxy } = require('@vendia/serverless-express');

const app = express();
app.use(express.json());
app.use(express.raw());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

const server = createServer(app);

let listeners: FaaSEventListener<any>[];

async function start() {
    const c = await container;
    ContainerProvider.set(c);
    app.all('*', async (req: any, res: any) => {
        const dispatcher = c.get<Dispatcher<HttpContext>>(Dispatcher);
        const httpContext = new HttpContext(req, res);
        Context.run(() => dispatcher.dispatch(httpContext));
    });
    listeners = c.getAll<FaaSEventListener<any>>(FaaSEventListener);

    return c.get<Application>(Application).start();
}

const startPromise = start();

export async function handler(event: string, context: any) {
    await startPromise;
    await Promise.all(listeners.map(l => l.onTrigger(event)));
    return proxy(server, event, context, 'PROMISE').promise;
}
