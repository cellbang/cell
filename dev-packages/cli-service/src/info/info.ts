
import { HookExecutor } from '../hook';
import { CliContext } from '@malagu/cli-common';
import { ServiceContextUtils } from '../context';

export interface InfoOptions {
    entry?: string;
}

export default async (cliContext: CliContext, options: InfoOptions) => {
    try {
        const ctx = await ServiceContextUtils.createDeployContext(cliContext, {
            dev: false,
            ...options
        });
        const hookExecutor = new HookExecutor();
        await hookExecutor.executeInfoHooks(ctx);

    } catch (error) {
        console.error(error);
        process.exit(-1);
    }
};
