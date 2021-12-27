
import build from '../build/build';
import { spawnProcess } from '@malagu/cli-common/lib/packager/utils';
import { HookExecutor } from '@malagu/cli-common/lib/hook/hook-executor';
import { CliContext, ContextUtils } from '@malagu/cli-common/lib/context/context-protocol';
import { ConfigUtil } from '@malagu/cli-common/lib/utils/config-util';

export interface DeplyOptions {
    entry?: string;
    skipBuild?: boolean;
    exit?: boolean;
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

        const backendConfig = ConfigUtil.getBackendConfig(cliContext.cfg);
        const frontendConfig = ConfigUtil.getFrontendConfig(cliContext.cfg);

        const deployCommand: string = backendConfig.deployCommand || frontendConfig.deployCommand;
        if (deployCommand) {
            const args = deployCommand.split(/\s+/);
            await spawnProcess(args.shift()!, args, { stdio: 'inherit' });
        }
        const hookExecutor = new HookExecutor();
        await hookExecutor.executeDeployHooks(ctx);
        if (options.exit === false) {
            process.exit(0);
        }
    } catch (error) {
        console.error(error);
        process.exit(-1);
    }
};
