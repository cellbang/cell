import * as webpack from 'webpack';
import * as https from 'https';
import * as http from 'http';
import { LoggerUtil } from '@malagu/cli-common/lib/utils/logger-util';
import { CommandUtil, CommandType } from '@malagu/cli-common/lib/utils/command-util';
import { CliContext } from '@malagu/cli-common/lib/context/context-protocol';
import { HookExecutor, HookStage } from '@malagu/cli-common/lib/hook/hook-executor';

export type ExecuteServeHooks = (server: http.Server | https.Server, app: Express.Application,
    compiler: webpack.Compiler, entryContextProvider: () => Promise<any>) => Promise<void>;

export class ServeManager {

    constructor(
        protected readonly context: CliContext) {
    }

    protected log() {
        LoggerUtil.printStage(this.context);
        LoggerUtil.printMode(this.context);
        LoggerUtil.printTargets(this.context);
        LoggerUtil.printComponents(this.context);
    }

    async start() {

        this.log();

        const hookExecutor = new HookExecutor();
        await hookExecutor.executeServeHooks(this.context, HookStage.before);

        await CommandUtil.executeCommand(this.context, CommandType.CompileCommand);

        await CommandUtil.executeCommand(this.context, CommandType.ServeCommand, async (command, target) => command.replace(/\$PORT/g, this.context.port));

        await hookExecutor.executeServeHooks(this.context);
        await hookExecutor.executeServeHooks(this.context, HookStage.after);
    }
}
