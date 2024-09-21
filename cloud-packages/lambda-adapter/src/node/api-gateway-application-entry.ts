import { container } from '@celljs/core/lib/common/container/dynamic-container';
import { Application } from '@celljs/core/lib/common/application/application-protocol';
import { ContainerProvider } from '@celljs/core/lib/common/container/container-provider';
import { Dispatcher } from '@celljs/web/lib/node/dispatcher/dispatcher-protocol';
import { Context } from '@celljs/web/lib/node/context';
import { FaaSEventListener } from '@celljs/faas-adapter/lib/node/event/event-protocol';
import { FaaSUtils } from '@celljs/faas-adapter/lib/node/utils';
import * as express from 'express';
const createProxy = require('@vendia/serverless-express');

const app = express();

const proxy = createProxy({ app });

let listeners: FaaSEventListener<any, void>[];

async function start() {
    const c = await container;
    ContainerProvider.set(c);
    app.all('*', async (req: any, res: any) => {
        const dispatcher = c.get<Dispatcher<Context>>(Dispatcher);
        const httpContext = new Context(req, res);
        Context.run(() => dispatcher.dispatch(httpContext));
    });
    listeners = c.getAll<FaaSEventListener<any, void>>(FaaSEventListener);

    return c.get<Application>(Application).start();
}

const startPromise = start();

export async function handler(event: string, context: any) {
    await startPromise;
    await Promise.all(listeners.map(l => l.onTrigger(event)));
    context.callbackWaitsForEmptyEventLoop = FaaSUtils.getCallbackWaitsForEmptyEventLoop();
    return proxy(event, context);
}
