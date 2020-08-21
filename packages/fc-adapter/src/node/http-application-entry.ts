import { container } from '@malagu/core/lib/common/container/dynamic-container';
import { ContainerProvider, Application, ConfigUtil } from '@malagu/core';
import { Dispatcher, Context } from '@malagu/web/lib/node';
import { HttpContext } from '@malagu/web/lib/node';
import * as express from 'express';
import * as proxy from '@webserverless/fc-express';
import { ENDPOINT } from '@malagu/web';
const getRawBody = require('raw-body');

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
        const endpoint = ConfigUtil.get<string | undefined>(ENDPOINT);
        if (endpoint) {
            res.header('Access-Control-Allow-Origin', endpoint);
        }
        const dispatcher = c.get<Dispatcher<HttpContext>>(Dispatcher);
        const httpContext = new HttpContext(req, res);
        Context.run(() => dispatcher.dispatch(httpContext));
    });

    return c.get<Application>(Application).start();
}

const startPromise = start();

export async function handler(req: any, res: any, context: any) {
    req.body = await getRawBody(req);
    await startPromise;
    server.httpProxy(req, res, context);
}
