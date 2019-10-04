import { container } from '@malagu/core/lib/common/container/dynamic-container';
import { ContainerProvider, Application } from '@malagu/core';
import { Dispatcher, Context } from '@malagu/core/lib/node';
import { ApiGatewayContext, Callback } from './context';

export async function init(context: any, callback: any) {
    try {
        const c = await container;
        await c.get<Application>(Application).start();
        callback(undefined, '');
    } catch (err) {
        callback(err);
    }
}

export async function handler(event: string, context: any, callback: Callback) {
    try {
        const c = await container;
        ContainerProvider.set(c);
        const dispatcher = c.get<Dispatcher<ApiGatewayContext>>(Dispatcher);
        const apiGatewayContext = new ApiGatewayContext(event, context, callback);
        Context.run(() => dispatcher.dispatch(apiGatewayContext));
    } catch (err) {
        callback(undefined, {
            isBase64Encoded: false,
            statusCode: 500,
            body: err
        });
    }
}
