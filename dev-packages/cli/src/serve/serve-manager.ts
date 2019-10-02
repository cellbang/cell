import * as webpack from 'webpack';
import { startDevServer } from './start-dev-server';
import { HookExecutor } from '../hook/hook-executor';
import * as https from 'https';
import * as http from 'http';
import { ServeContext, CliContext } from '../context';

export type ExecuteServeHooks = (server: http.Server | https.Server, app: Express.Application, compiler: webpack.Compiler, entryContextProvider: () => any) => Promise<void>;

export class ServeManager {

    constructor(
        protected readonly context: CliContext,
        protected readonly configurations: webpack.Configuration[]) {

    }

    start() {
        startDevServer(this.configurations,
            async (server: http.Server | https.Server, app: Express.Application, compiler: webpack.Compiler, entryContextProvider: () => Promise<any>) => {
            const serveContext = <ServeContext>{
                pkg: this.context.pkg,
                cliContext: this.context,
                configurations: this.configurations,
                server,
                app,
                compiler,
                entryContextProvider
            };
            await new HookExecutor().executeServeHooks(serveContext);
        });
    }

}
