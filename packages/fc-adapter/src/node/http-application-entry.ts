import { container } from '@malagu/core/lib/common/container/dynamic-container';
import { ContainerProvider, Application } from '@malagu/core';
import { Dispatcher, Context, HttpContext } from '@malagu/web/lib/node';
import { ParseHttpTriggerContext } from './context';
import * as getRawBody from 'raw-body';

let startPromise: Promise<void>;

async function start() {
    const c = await container;
    ContainerProvider.set(c);
    return c.get<Application>(Application).start();
}

export async function init(context: any, callback: any) {
    try {
        startPromise = start();
        await startPromise;
        callback(undefined, '');
    } catch (err) {
        callback(err);
    }
}

export async function handler(request: any, response: any, context: any) {
    try {
        request.body = await getRawBody(request).then(body => body.toString());
        if (startPromise) {
            await startPromise;
        } else {
            await start();
        }
        const httpContext = ParseHttpTriggerContext(request, response, context);
        const c = await container;
        const dispatcher = c.get<Dispatcher<HttpContext>>(Dispatcher);
        Context.run(() => dispatcher.dispatch(httpContext));
    } catch (err) {
        console.log(err);
        response.statusCode = 500;
        response.send(err);
    }
}
