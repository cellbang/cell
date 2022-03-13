import { ServeContext } from '@malagu/cli-service/lib/context/context-protocol';
import { ConfigUtil } from '@malagu/cli-common/lib/utils/config-util';

export async function after(context: ServeContext) {
    const { entryContextProvider, cfg, server } = context;
    if (!entryContextProvider) {
        return;
    }
    server.close();
    let { port, path } = ConfigUtil.getBackendMalaguConfig(cfg).server;
    port = context.port || port || 9000;
    process.env.SERVER_PATH = path;
    process.env.SERVER_PORT = port;
    process.env.PORT = port;

    let targetServer: any;
    context.compiler.hooks.done.tap('WebServe', async () => {
        if (targetServer?.close) {
            targetServer.close();
        }
        const app = await entryContextProvider();
        let target = await app;
        if (typeof app === 'object' && app.default) {
            target = await app.default;
        }
        if (target && typeof target.listen === 'function') {
            targetServer = target.listen(port);
            targetServer = target.close ? target : targetServer;
            return;
        }

        if (typeof target === 'function') {
            targetServer = await target(port);
        }
    });

};
