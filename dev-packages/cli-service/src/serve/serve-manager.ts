import * as webpack from 'webpack';
import { startDevServer } from './start-dev-server';
import { HookExecutor } from '../hooks';
import * as https from 'https';
import * as http from 'http';
import { ConfigurationContext, ServiceContextUtils } from '../context';
import { LoggerUtil, spawnProcess } from '@malagu/cli-common';

export type ExecuteServeHooks = (server: http.Server | https.Server, app: Express.Application,
    compiler: webpack.Compiler, entryContextProvider: () => Promise<any>) => Promise<void>;

export class ServeManager {

    constructor(
        protected readonly context: ConfigurationContext) {
    }

    protected log() {
        LoggerUtil.printStage(this.context);
        LoggerUtil.printMode(this.context);
        LoggerUtil.printTargets(this.context);
        LoggerUtil.printComponents(this.context);
    }

    async start() {
        this.log();

        const compileCommand: string = this.context.framework?.settings?.compileCommand;
        if (compileCommand) {
            const args = compileCommand.split(/\s+/);
            await spawnProcess(args.shift()!, args, { stdio: 'inherit' });
        }

        const serveCommand: string = this.context.framework?.settings?.serveCommand;
        if (serveCommand) {
            const args = serveCommand.split(/\s+/);
            await spawnProcess(args.shift()!, args, { stdio: 'inherit' });
        }
        return startDevServer(this.context,
            async (server: http.Server | https.Server, app: Express.Application, compiler: webpack.Compiler, entryContextProvider: () => Promise<any>) => {
                const serveContext = await ServiceContextUtils.createServeContext(
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
