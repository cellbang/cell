import { container } from '@malagu/core/lib/common/container/dynamic-container';
import { Application } from '@malagu/core/lib/common/application/application-protocol';
import { ContainerProvider } from '@malagu/core/lib/common/container/container-provider';
import { FaaSUtils } from '@malagu/faas-adapter/lib/node/utils';
import { Dispatcher } from '@malagu/web/lib/node/dispatcher/dispatcher-protocol';
import { Context, HttpContext } from '@malagu/web/lib/node/context';
import { FaaSEventListener } from '@malagu/faas-adapter/lib/node/event/event-protocol';
import * as express from 'express';
const { createServer, proxy } = require('tencent-serverless-http');

const app = express();

const server = createServer(app);

let listeners: FaaSEventListener<any, void>[];

async function start() {
    const c = await container;
    ContainerProvider.set(c);
    app.all('*', async (req: any, res: any) => {
        const dispatcher = c.get<Dispatcher<HttpContext>>(Dispatcher);
        const httpContext = new HttpContext(req, res);
        Context.run(() => dispatcher.dispatch(httpContext));
    });

    listeners = c.getAll<FaaSEventListener<any, void>>(FaaSEventListener);

    return c.get<Application>(Application).start();
}

const startPromise = start();

export async function handler(event: string, context: any) {
    await startPromise;
    await Promise.all(listeners.map(l => l.onTrigger(event)));
    const result = await proxy(server, event, context, 'PROMISE');
    context.callbackWaitsForEmptyEventLoop = FaaSUtils.getCallbackWaitsForEmptyEventLoop();
    return result.promise;
}
