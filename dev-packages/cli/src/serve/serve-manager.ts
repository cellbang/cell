import * as webpack from 'webpack';
import { startDevServer } from './start-dev-server';
import { HookExecutor } from '../hook/hook-executor';
import * as https from 'https';
import * as http from 'http';
import { ConfigurationContext, ContextUtils } from '../context';

export type ExecuteServeHooks = (server: http.Server | https.Server, app: Express.Application,
    compiler: webpack.Compiler, entryContextProvider: () => Promise<any>) => Promise<void>;

export class ServeManager {

    constructor(
        protected readonly context: ConfigurationContext) {
    }

    start() {
        startDevServer(this.context.configurations,
            async (server: http.Server | https.Server, app: Express.Application, compiler: webpack.Compiler, entryContextProvider: () => Promise<any>) => {
                const serveContext = await ContextUtils.createServeContext(
                    this.context,
                    server,
                    app,
                    compiler,
                    entryContextProvider
                );
                await new HookExecutor().executeServeHooks(serveContext);
            });
    }

}
