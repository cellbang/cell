import { container } from '@malagu/core/lib/common/container/dynamic-container';
import { Application } from '@malagu/core/lib/common/application/application-protocol';
import { ContainerProvider } from '@malagu/core/lib/common/container/container-provider';
import { Dispatcher } from '@malagu/web/lib/node/dispatcher/dispatcher-protocol';
import { Context, HttpContext } from '@malagu/web/lib/node/context';
import { FaaSEventListener } from '@malagu/faas-adapter/lib/node/event/event-protocol';
import * as express from 'express';
import * as proxy from '@webserverless/fc-express';

let listeners: FaaSEventListener<any>[];

const app = express();
app.use(express.json());
app.use(express.raw());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

const server = new proxy.Server(app);

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
