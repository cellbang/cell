
import { CommandUtil, CommandType, CommandStage } from '@malagu/cli-common/lib/utils/command-util';
import { HookExecutor, HookStage } from '@malagu/cli-common/lib/hook/hook-executor';
import { BuildContext } from '@malagu/cli-common/lib/context/context-protocol';
import { PathUtil } from '@malagu/cli-common/lib/utils/path-util';
import { LoggerUtil } from '@malagu/cli-common/lib/utils/logger-util';
const rimraf = require('rimraf');

export class BuildManager {

    constructor(protected readonly ctx: BuildContext) {

    }

    protected cleanDistDir() {
        rimraf.sync(PathUtil.getProjectDistPath());
    }

    protected log() {
        LoggerUtil.printStage(this.ctx);
        LoggerUtil.printMode(this.ctx);
        LoggerUtil.printTargets(this.ctx);
        LoggerUtil.printComponents(this.ctx);
    }

    async build(): Promise<void> {
        this.log();
        this.cleanDistDir();

        const hookExecutor = new HookExecutor();
        await CommandUtil.executeCommand(this.ctx, CommandType.CompileCommand, CommandStage.before);
        await hookExecutor.executeCompileHooks(this.ctx, HookStage.before);

        await CommandUtil.executeCommand(this.ctx, CommandType.CompileCommand);
        await hookExecutor.executeCompileHooks(this.ctx);

        await CommandUtil.executeCommand(this.ctx, CommandType.CompileCommand, CommandStage.after);
        await hookExecutor.executeCompileHooks(this.ctx, HookStage.after);

        await CommandUtil.executeCommand(this.ctx, CommandType.BuildCommand, CommandStage.before);
        await hookExecutor.executeBuildHooks(this.ctx, HookStage.before);

        await CommandUtil.executeCommand(this.ctx, CommandType.BuildCommand);
        await hookExecutor.executeBuildHooks(this.ctx);

        await CommandUtil.executeCommand(this.ctx, CommandType.BuildCommand, CommandStage.after);
        await hookExecutor.executeBuildHooks(this.ctx, HookStage.after);
    }

}
