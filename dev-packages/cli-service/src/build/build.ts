
import { CliContext, PathUtil, ContextUtils } from '@malagu/cli-common';
import { BuildManager } from './build-manager';
import { readdirSync, statSync } from 'fs-extra';
import { join } from 'path';
const rimraf = require('rimraf');

export interface BuildOptions {
    entry?: string;
}

export default async (cliContext: CliContext, options: BuildOptions) => {
    try {
        const { runtime } = cliContext;
        rimraf.sync(PathUtil.getProjectDistPath(runtime));
        PathUtil.getProjectDistPath(runtime);
        if (runtime) {
            const distParentPath = PathUtil.getProjectDistParentPath(runtime);
            const targets = readdirSync(distParentPath);
            if (targets.length >= 5) {
                for (const target of targets) {
                    const stats = statSync(join(distParentPath, target));
                    if (stats.isDirectory() && Date.now() - stats.ctimeMs > 24 * 60 * 60 * 1000) {
                        rimraf.sync(join(distParentPath, target));
                    }
                }
            }
        }

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
