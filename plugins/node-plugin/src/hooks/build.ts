import { CliContext } from '@malagu/cli-common/lib/context/context-protocol';
import { PathUtil } from '@malagu/cli-common/lib/utils/path-util';
import { ConfigUtil } from '@malagu/cli-common/lib/utils/config-util';
import { EMPTY } from '@malagu/cli-common/lib/constants';
import { existsSync, readFileSync, writeFileSync, ensureDir, remove } from 'fs-extra';
import { join } from 'path';
import { ApplicationConfig } from '@malagu/cli-common/lib/package/application-config';
import { CommandUtil } from '@malagu/cli-common/lib/utils/command-util';

async function renderEntry(entryTemplate: string, cfg: ApplicationConfig, entry: string) {
    ensureDir(PathUtil.getProjectHomePath());
    const server = ConfigUtil.getBackendMalaguConfig(cfg).server;
    const port = server?.port ?? 9000;
    let path = server?.path ?? '';
    let entryContent = readFileSync(entryTemplate, { encoding: 'utf8' });
    entry = entry.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    path = path.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    entryContent = entryContent
        .replace(/{{ entry }}/g, entry)
        .replace(/{{ port }}/g, port)
        .replace(/{{ path }}/g, path);
    await ensureDir(PathUtil.getBackendProjectDistPath());
    const newEntry = join(PathUtil.getBackendProjectDistPath(), 'gen-entry.js');
    writeFileSync(newEntry, entryContent, { encoding: 'utf8' });
    return newEntry;

}
export async function before(ctx: CliContext) {
    const { pkg, cfg } = ctx;

    const config = ConfigUtil.getBackendConfig(cfg)

    if (!config.entry) {
        return;
    }

    let entryPath = config.entry.path ? config.entry.path : config.entry;

    if (entryPath === EMPTY) {
        return;
    }

    if (config.entry.raw) {
        return;
    }
    
    if (CommandUtil.includesCommand(ctx.args, [ 'build', 'deploy' ])) {
        const isLambda = pkg.componentPackages.some(c => c.name === '@malagu/lambda-plugin');
        const isFastify = pkg.framework?.name === 'fastify';
        let entryTemplate = join(__dirname, '..', 'entry.js'); 
        if (isLambda) {
            if (pkg.framework?.name === 'nest') {
                console.warn('Next Fromework does not support deployment to AWS Lambda by default.');
            } else if (isFastify) {
                entryTemplate = join(__dirname, '..', 'lambda-fastify-entry.js'); 
            } else {
                entryTemplate = join(__dirname, '..', 'lambda-entry.js'); 
            }
        }

        config.entry = await renderEntry(entryTemplate, cfg, entryPath);
    }
};


export async function after(ctx: CliContext) {

    const genEntry = join(PathUtil.getBackendProjectDistPath(), 'gen-entry.js');
    if (existsSync(genEntry)) {
        remove(genEntry);
    }
};
