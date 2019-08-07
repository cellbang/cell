import { container } from '@malagu/core/lib/common/dynamic-container';
import { Dispatcher, Context } from '@malagu/core/lib/node';
import { ApiGatewayContext, Callback } from './context';

export async function init(context: any, callback: any) {
    try {
        await container;
        callback(undefined, '');
    } catch (err) {
        callback(err);
    }
}

export function handler(event: string, context: any, callback: Callback) {
    container.then(c => {
        const dispatcher = c.get<Dispatcher<ApiGatewayContext>>(Dispatcher);
        const apiGatewayContext = new ApiGatewayContext(event, context, callback);
        Context.run(() => dispatcher.dispatch(apiGatewayContext));
    });
}
