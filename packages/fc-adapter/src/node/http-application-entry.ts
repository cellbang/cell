import { container } from '@malagu/core/lib/common/dynamic-container';
import { Dispatcher, Context } from '@malagu/core/lib/node';
import { HttpContext } from './context';
import { ContainerProvider } from '@malagu/core/lib/common/container-provider';
import * as getRawBody from 'raw-body';
import { Application } from '@malagu/core/lib/common/application-protocol';

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
        const httpContext = new HttpContext(request, response, context);
        const c = await container;
        const dispatcher = c.get<Dispatcher<HttpContext>>(Dispatcher);
        Context.run(() => dispatcher.dispatch(httpContext));
    } catch (err) {
        response.statusCode = 500;
        response.send(err);
    }
}
