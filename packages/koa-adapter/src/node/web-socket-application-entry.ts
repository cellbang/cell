import { container } from '@malagu/core/lib/common/dynamic-container';
import { Dispatcher, WebSocketContext } from '@malagu/core/lib/node';
import * as Koa from 'koa';
import * as route from 'koa-route';
import * as websockify from 'koa-websocket';
import { ConfigProvider } from '@malagu/core/lib/common/config-provider';
import { DEFAULT_SERVER_OPTIONS } from './context';

container.then(c => {
    const configProvider = c.get<ConfigProvider>(ConfigProvider);
    const { port, path, wsOptions, httpsOptions  } = configProvider.get<any>('server', DEFAULT_SERVER_OPTIONS);
    const app = websockify(new Koa(), wsOptions, httpsOptions);

    app.ws.use(route.all(path, ctx => {
        const dispatcher = c.get<Dispatcher<WebSocketContext>>(Dispatcher);
        if (app.ws.server) {
            new WebSocketContext(app.ws.server, ctx.websocket, dispatcher);
        }
    }));

    app.listen(port);
});
