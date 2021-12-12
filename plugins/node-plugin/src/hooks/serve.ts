import { ServeContext, ConfigUtil } from '@malagu/cli-service';

export default async (context: ServeContext) => {
    const { entryContextProvider, server, cfg } = context;
    let { port, path } = ConfigUtil.getBackendMalaguConfig(cfg).server;
    port = port || 9000;
    process.env.SERVER_PATH = path;
    process.env.SERVER_PORT = port;

    let targetServer: any;
    context.compiler.hooks.done.tap('WebServe', async () => {
        if (targetServer?.close) {
            targetServer.close();
        }
        const app = await entryContextProvider();
        let target = app;
        if (typeof app === 'object' && app.default) {
            target = app.default;
        }
        if (target && typeof target.listen === 'function') {
            targetServer = target.listen(port);
            return;
        }

        if (typeof target === 'function') {
            target(port);
        }
        if (!targetServer?.close) {
            server.close();
        }

    });

};
