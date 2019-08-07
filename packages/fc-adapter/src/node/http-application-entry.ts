import { container } from '@malagu/core/lib/common/dynamic-container';
import { Dispatcher, Context } from '@malagu/core/lib/node';
import { HttpContext } from './context';

export async function init(context: any, callback: any) {
    try {
        await container;
        callback(undefined, '');
    } catch (err) {
        callback(err);
    }
}

export function handler(request: any, response: any, context: any) {
    container.then(c => {
        const dispatcher = c.get<Dispatcher<HttpContext>>(Dispatcher);
        const httpContext = new HttpContext(request, response, context);
        Context.run(() => dispatcher.dispatch(httpContext));
    });
}
