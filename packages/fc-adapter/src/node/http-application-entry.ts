import { container } from '@malagu/core/lib/common/container/dynamic-container';
import { ContainerProvider, Application } from '@malagu/core';
import { Dispatcher, Context } from '@malagu/core/lib/node';
import { HttpTriggerContext } from './context';
import * as getRawBody from 'raw-body';

export async function init(context: any, callback: any) {
    try {
        const c = await container;
        ContainerProvider.set(c);
        await c.get<Application>(Application).start();
        callback(undefined, '');
    } catch (err) {
        callback(err);
    }
}

export async function handler(request: any, response: any, context: any) {
    try {
        request.body = await getRawBody(request).then(body => body.toString());
        const httpContext = new HttpTriggerContext(request, response, context);
        const c = await container;
        const dispatcher = c.get<Dispatcher<HttpTriggerContext>>(Dispatcher);
        Context.run(() => dispatcher.dispatch(httpContext));
    } catch (err) {
        console.log(err);
        response.statusCode = 500;
        response.send(err);
    }
}
