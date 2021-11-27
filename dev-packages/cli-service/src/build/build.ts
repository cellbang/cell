
import { CliContext } from '@malagu/cli-common';
import { BuildManager } from './build-manager';
import { ServiceContextUtils } from '../context';

export interface BuildOptions {
    entry?: string;
}

export default async (cliContext: CliContext, options: BuildOptions) => {
    try {
        const ctx = await ServiceContextUtils.createBuildContext(cliContext, {
            ...options
        });
        await new BuildManager(ctx).build();
    } catch (error) {
        console.error(error);
        process.exit(-1);
    }
};
