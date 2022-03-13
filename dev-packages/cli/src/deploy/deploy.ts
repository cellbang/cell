
import build from '../build/build';
import { HookExecutor, HookStage } from '@malagu/cli-common/lib/hook/hook-executor';
import { CliContext, ContextUtils } from '@malagu/cli-common/lib/context/context-protocol';
import { CommandUtil, CommandType } from '@malagu/cli-common/lib/utils/command-util';

export interface DeplyOptions {
    skipBuild?: boolean;
}

export default async (ctx: CliContext, options: DeplyOptions) => {
    try {
        ctx.options = options;
        ctx = ContextUtils.mergeContext(ctx, options);
        const hookExecutor = new HookExecutor();
        await hookExecutor.executeDeployHooks(ctx, HookStage.before);
        if (!options.skipBuild) {
            await build(ctx, options);
        }

        await CommandUtil.executeCommand(ctx, CommandType.DeployCommand);

        await hookExecutor.executeDeployHooks(ctx);
        await hookExecutor.executeDeployHooks(ctx, HookStage.after);
    } catch (error) {
        console.error(error);
        process.exit(-1);
    }
};
