import * as webpack from 'webpack';
import { CliContext } from '@malagu/cli-common/lib/context/context-protocol';
import { CommandStage, CommandType, CommandUtil } from '@malagu/cli-common/lib/utils/command-util';
import { ServiceContextUtils } from '../context/context-protocol';
import { startDevServer } from './start-dev-server';
import * as https from 'https';
import * as http from 'http';
import { HookExecutor, HookStage } from '@malagu/cli-common/lib/hook/hook-executor';

export type Callback = (server: http.Server | https.Server, app: Express.Application,
    compiler: webpack.Compiler, entryContextProvider: () => Promise<any>) => Promise<void>;

export default async (ctx: CliContext) => {
    const context = await ServiceContextUtils.createConfigurationContext(ctx);
    const configurations = context.configurations;
    context.configurations = [];
    for (const c of configurations) {
        if (!await CommandUtil.hasCommand(ctx, c.get('name'), CommandType.ServeCommand)) {
            context.configurations.push(c);
        }
    }

    if (context.configurations.length > 0) {
        return startDevServer(context,
            async (server, app, compiler, entryContextProvider) => {
                context.server = server;
                context.app = app;
                context.compiler = compiler;
                context.entryContextProvider = entryContextProvider;
                compiler.hooks.done.tap('ServeAfter', async stats => {
                    context.stats = stats;
                    new HookExecutor().executeServeHooks(context, HookStage.after);
                    await CommandUtil.executeCommand(context, CommandType.ServeCommand, CommandStage.after);
                });
            });
    }
};
