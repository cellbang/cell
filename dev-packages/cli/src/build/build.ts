
import { CliContext, ContextUtils } from '@malagu/cli-common/lib/context/context-protocol';
import { BuildManager } from './build-manager';

export interface BuildOptions {
}

export default async (ctx: CliContext, options: BuildOptions) => {
    try {
        ctx.options = options;
        ctx = ContextUtils.mergeContext(ctx, options);
        await new BuildManager(ctx).build();
    } catch (error) {
        console.error(error);
        process.exit(-1);
    }
};
