import { container } from '@celljs/core/lib/common/container/dynamic-container';
import { Application } from '@celljs/core/lib/common/application/application-protocol';
import { ContainerProvider } from '@celljs/core/lib/common/container/container-provider';
import { Dispatcher } from '@celljs/web/lib/node/dispatcher/dispatcher-protocol';
import { Context } from '@celljs/web/lib/node/context';
import { FaaSEventListener } from '@celljs/faas-adapter/lib/node/event/event-protocol';
import * as express from 'express';
import * as proxy from '@webserverless/fc-express';

let listeners: FaaSEventListener<any, void>[];

const app = express();

const server = new proxy.Server(app);

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

export async function handler(event: string, context: any, callback: any) {
    process.env.ALIBABA_ACCOUNT_ID = context.accountId;
    process.env.ALIBABA_ACCESS_KEY_ID = context.credentials?.accessKeyId;
    process.env.ALIBABA_ACCESS_KEY_SECRET = context.credentials?.accessKeySecret;
    process.env.ALIBABA_SECURITY_TOKEN = context.credentials?.securityToken;
    process.env.ALIBABA_REQUEST_ID = context.requestId;
    process.env.ALIBABA_REGION = context.region;
    process.env.IGNORE_EVENT_HEADER = 'true';
    process.env.IGNORE_CONTEXT_HEADER = 'true';
    try {
        await startPromise;
        await Promise.all(listeners.map(l => l.onTrigger(event)));
    } catch (error) {
        callback(undefined, error);
    }
    server.proxy(event, context, callback);
}
