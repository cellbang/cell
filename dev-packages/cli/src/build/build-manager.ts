
import { CommandUtil, CommandType } from '@malagu/cli-common/lib/utils/command-util';
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
        await hookExecutor.executeBuildHooks(this.ctx, HookStage.before);

        await CommandUtil.executeCommand(this.ctx, CommandType.CompileCommand);

        await CommandUtil.executeCommand(this.ctx, CommandType.BuildCommand);

        await hookExecutor.executeBuildHooks(this.ctx);
        await hookExecutor.executeBuildHooks(this.ctx, HookStage.after);
    }

}
