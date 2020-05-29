import { container } from '@malagu/core/lib/common/container/dynamic-container';
import { ContainerProvider, Application } from '@malagu/core';
import { Dispatcher, Context } from '@malagu/web/lib/node';
import { parseApiGatewayContext, Callback } from './context';
import { HttpContext } from '@malagu/web/lib/node';

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

export async function handler(event: string, context: any, callback: Callback) {
    try {
        if (startPromise) {
            await startPromise;
        } else {
            await start();
        }
        const c = await container;
        ContainerProvider.set(c);
        const dispatcher = c.get<Dispatcher<HttpContext>>(Dispatcher);
        const apiGatewayContext = parseApiGatewayContext(event, context, callback);
        Context.run(() => dispatcher.dispatch(apiGatewayContext));
    } catch (err) {
        callback(undefined, {
            isBase64Encoded: false,
            statusCode: 500,
            body: err
        });
    }
}
