import { container } from '@malagu/core/lib/common/container/dynamic-container';
import { ContainerProvider, Application } from '@malagu/core';
import { Dispatcher, Context } from '@malagu/web/lib/node';
import { HttpContext } from '@malagu/web/lib/node';
import * as express from 'express';
import * as proxy from '@webserverless/fc-express';

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
    process.env.ALIBABA_REGION = context.region;
    process.env.IGNORE_EVENT_HEADER = 'true';
    process.env.IGNORE_CONTEXT_HEADER = 'true';
    await startPromise;
    server.proxy(event, context, callback);
}
