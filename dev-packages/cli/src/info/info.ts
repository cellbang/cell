
import { CliContext, HookExecutor, ContextUtils, LoggerUtil } from '@malagu/cli-common';

export interface InfoOptions {}

export default async (cliContext: CliContext, options: InfoOptions) => {
    try {
        cliContext.options = options;
        const ctx = await ContextUtils.createInfoContext(cliContext);

        LoggerUtil.printStage(ctx);
        LoggerUtil.printMode(ctx);
        LoggerUtil.printTargets(ctx);
        LoggerUtil.printComponents(ctx);

        const hookExecutor = new HookExecutor();
        await hookExecutor.executeInfoHooks(ctx);
    } catch (error) {
        console.error(error);
        process.exit(-1);
    }
};
