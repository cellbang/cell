
import { HookExecutor } from '../hook';
import { BuildManager } from '../build/build-manager';
import { CliContext } from '@malagu/cli-common';
import { ServiceContextUtils } from '../context';

export interface DeplyOptions {
    entry?: string;
    skipBuild?: boolean;
}

export default async (cliContext: CliContext, options: DeplyOptions) => {
    try {
        const ctx = await ServiceContextUtils.createDeployContext(cliContext, {
            dev: false,
            ...options
        });
        if (!options.skipBuild) {
            await new BuildManager(ctx).build();
        }
        const hookExecutor = new HookExecutor();
        await hookExecutor.executeDeployHooks(ctx);
    } catch (error) {
        console.error(error);
        process.exit(-1);
    }
};
