
import { ServeManager } from './serve-manager';
import { CliContext, ContextUtils } from '@celljs/cli-common/lib/context/context-protocol';

export interface ServeOptions {
    port?: string;
}

export default async (ctx: CliContext, options: ServeOptions) => {
    try {
        ctx.options = options;
        ctx =  ContextUtils.mergeContext(ctx, { dev: true, ...options });
        await new ServeManager(ctx).start();
    } catch (error) {
        console.error(error);
        process.exit(-1);
    }

};
