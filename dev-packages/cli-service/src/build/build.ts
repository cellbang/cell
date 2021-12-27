
import { CliContext, ContextUtils } from '@malagu/cli-common/lib/context/context-protocol';
import { BuildManager } from './build-manager';

export interface BuildOptions {
    entry?: string;
}

export default async (cliContext: CliContext, options: BuildOptions) => {
    try {
        const ctx = await ContextUtils.createBuildContext({
            ...cliContext,
            ...options
        });
        await new BuildManager(ctx).build();
    } catch (error) {
        console.error(error);
        process.exit(-1);
    }
};
