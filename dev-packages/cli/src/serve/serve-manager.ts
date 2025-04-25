import { LoggerUtil } from '@celljs/cli-common/lib/utils/logger-util';
import { CommandUtil, CommandType, CommandStage } from '@celljs/cli-common/lib/utils/command-util';
import { CliContext } from '@celljs/cli-common/lib/context/context-protocol';
import { HookExecutor, HookStage } from '@celljs/cli-common/lib/hook/hook-executor';
import { ConfigUtil } from '@celljs/cli-common/lib/utils';

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

        const commandRender = async (command: string, target: string) => {
            const { cfg, port } = this.context;
            const realPort = ConfigUtil.getPort(cfg, target, port);
            return command
                .replace(/\$PATH/g, ConfigUtil.getCellConfig(cfg, target).server?.path)
                .replace(/\$PORT/g, realPort);
        };

        const hookExecutor = new HookExecutor();
        await CommandUtil.executeCommand(this.context, CommandType.CompileCommand, CommandStage.before);
        await hookExecutor.executeCompileHooks(this.context, HookStage.before);

        await CommandUtil.executeCommand(this.context, CommandType.CompileCommand);
        await hookExecutor.executeCompileHooks(this.context);

        await CommandUtil.executeCommand(this.context, CommandType.ServeCommand, CommandStage.before, commandRender);
        await hookExecutor.executeServeHooks(this.context, HookStage.before);

        await CommandUtil.executeCommand(this.context, CommandType.ServeCommand, CommandStage.on, commandRender);
        await hookExecutor.executeServeHooks(this.context);

        await hookExecutor.executeCompileHooks(this.context, HookStage.after);
        await CommandUtil.executeCommand(this.context, CommandType.CompileCommand, CommandStage.after);

        await hookExecutor.executeServeHooks(this.context, HookStage.after);
        await CommandUtil.executeCommand(this.context, CommandType.ServeCommand, CommandStage.after, commandRender);
    }
}
