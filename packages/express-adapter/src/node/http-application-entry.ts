import { container } from '@celljs/core/lib/common/container/dynamic-container';
import { Application } from '@celljs/core/lib/common/application/application-protocol';
import { ContainerProvider } from '@celljs/core/lib/common/container/container-provider';
import { Dispatcher } from '@celljs/web/lib/node/dispatcher/dispatcher-protocol';
import { Context } from '@celljs/web/lib/node/context';
import { ServerAware } from '@celljs/web/lib/node/http';
import { ConfigProvider } from '@celljs/core/lib/common/config/config-protocol';

import * as express from 'express';
import { DEFAULT_SERVER_OPTIONS } from './context';

container.then(async c => {
    ContainerProvider.set(c);
    await c.get<Application>(Application).start();
    const configProvider = c.get<ConfigProvider>(ConfigProvider);
    const port = parseInt(process.env.SERVER_PORT || '') || configProvider.get<any>('cell.server', DEFAULT_SERVER_OPTIONS).port;
    const app = express();
    app.all('*', async (req: any, res: any) => {
        const dispatcher = c.get<Dispatcher<Context>>(Dispatcher);
        const httpContext = new Context(req, res);
        Context.run(() => dispatcher.dispatch(httpContext));
    });
    const server = app.listen(port);
    const items = c.getAll<ServerAware>(ServerAware);
    for (const serverAware of items) {
        await serverAware.setServer(server);
    }
    console.log(`serve ${port}`);
});
