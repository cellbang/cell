
import build from '../build/build';
import { CliContext, ContextUtils, HookExecutor } from '@malagu/cli-common';

export interface DeplyOptions {
    entry?: string;
    skipBuild?: boolean;
}

export default async (cliContext: CliContext, options: DeplyOptions) => {
    try {
        const ctx = await ContextUtils.createDeployContext({
            ...cliContext,
            ...options
        });
        if (!options.skipBuild) {
            await build(cliContext, options);
        }
        const hookExecutor = new HookExecutor();
        await hookExecutor.executeDeployHooks(ctx);
    } catch (error) {
        console.error(error);
        process.exit(-1);
    }
};
