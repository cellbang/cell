
import { HookExecutor } from '../hook/hook-executor';
import { ContextUtils } from '../context';
import { BuildManager } from '../build/build-manager';

export interface DeplyOptions {
    entry?: string;
    skipBuild?: boolean;
}

export default async (options: DeplyOptions) => {
    try {
        const ctx = await ContextUtils.createDeployContext(ContextUtils.getCurrent(), {
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
