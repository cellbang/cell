
import { CliContext, PathUtil } from '@malagu/cli-common';
import { BuildManager } from './build-manager';
import { ServiceContextUtils } from '../context';
const rimraf = require('rimraf');

export interface BuildOptions {
    entry?: string;
}

export default async (cliContext: CliContext, options: BuildOptions) => {
    try {
        const { runtime } = cliContext;
        rimraf.sync(PathUtil.getProjectDistPath(runtime));
        const ctx = await ServiceContextUtils.createBuildContext(cliContext, {
            ...options
        });
        await new BuildManager(ctx).build();
    } catch (error) {
        console.error(error);
        process.exit(-1);
    }
};
