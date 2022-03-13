import { CliContext } from '@malagu/cli-common/lib/context/context-protocol';
import { HookExecutor, HookStage } from '@malagu/cli-common/lib/hook/hook-executor';
import { LoggerUtil } from '@malagu/cli-common/lib/utils/logger-util';

export interface InfoOptions {}

export default async (ctx: CliContext, options: InfoOptions) => {
    try {
        ctx.options = options;
        const hookExecutor = new HookExecutor();
        await hookExecutor.executeInfoHooks(ctx, HookStage.before);

        LoggerUtil.printStage(ctx);
        LoggerUtil.printMode(ctx);
        LoggerUtil.printTargets(ctx);
        LoggerUtil.printComponents(ctx);

        await hookExecutor.executeInfoHooks(ctx);
    } catch (error) {
        console.error(error);
        process.exit(-1);
    }
};
