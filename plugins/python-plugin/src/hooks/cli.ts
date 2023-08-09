import { CliContext, ConfigUtil } from '@malagu/cli-common';
import { cleanupCache } from '../packager/clean';
import { parsePythonOptions } from '../packager/util';

export default async (ctx: CliContext) => {
    const { cfg, program } = ctx;
    let pluginOptions = ConfigUtil.getBackendMalaguConfig(cfg)['python-plugin'] || {};
    pluginOptions = parsePythonOptions(pluginOptions);

    program
        .command('clean')
        .description('removes all items in the pip download/static cache (if present)')
        .action(() => {
            cleanupCache(pluginOptions);
        });

};
