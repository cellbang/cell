import { container } from '@malagu/core/lib/common/container/dynamic-container';
import { Application } from '@malagu/core/lib/common/application/application-protocol';
import { ContainerProvider } from '@malagu/core/lib/common/container/container-provider';
import { Dispatcher } from '@malagu/web/lib/node/dispatcher/dispatcher-protocol';
import { Context, HttpContext } from '@malagu/web/lib/node/context';
import { ConfigProvider } from '@malagu/core/lib/common/config/config-protocol';

import * as express from 'express';
import { DEFAULT_SERVER_OPTIONS } from './context';

container.then(async c => {
    ContainerProvider.set(c);
    await c.get<Application>(Application).start();
    const configProvider = c.get<ConfigProvider>(ConfigProvider);
    const port = parseInt(process.env.SERVER_PORT || '') || configProvider.get<any>('malagu.server', DEFAULT_SERVER_OPTIONS).port;

    const app = express();
    app.all('*', async (req: any, res: any) => {
        const dispatcher = c.get<Dispatcher<HttpContext>>(Dispatcher);
        const httpContext = new HttpContext(req, res);
        Context.run(() => dispatcher.dispatch(httpContext));
    });
    app.listen(port);
    console.log(`serve ${port}`);
});
