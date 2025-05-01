import { CliContext } from '@celljs/cli-common/lib/context';
import { ConfigUtil } from '@celljs/cli-common/lib/utils';
import { join, resolve } from 'path';
import { PathUtil } from '@celljs/cli-common/lib/utils/path-util';
import { EMPTY } from '@celljs/cli-common/lib/constants';
import { readFileSync, writeFileSync, ensureDir, existsSync } from 'fs-extra';
import { ApplicationConfig } from '@celljs/cli-common/lib/package/application-config';
import { CommandUtil } from '@celljs/cli-common/lib/utils/command-util';

export async function renderEntry(ctx: CliContext) {
    const { pkg, cfg } = ctx;

    const config = ConfigUtil.getBackendConfig(cfg);

    if (!config.entry) {
        return;
    }

    const entryPath = config.entry.path ? config.entry.path : config.entry;

    if (entryPath === EMPTY) {
        return;
    }

    if (config.entry.raw) {
        return;
    }

    if (CommandUtil.includesCommand(ctx.args, [ 'build', 'deploy' ])) {
        const isLambda = pkg.componentPackages.some(c => c.name === '@celljs/lambda-plugin');
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

        config.entry = await doRenderEntry(entryTemplate, cfg, entryPath);
    }
}

async function doRenderEntry(entryTemplate: string, cfg: ApplicationConfig, entry: string) {
    ensureDir(PathUtil.getProjectHomePath());
    const config = ConfigUtil.getBackendCellConfig(cfg);
    const server = config.server;
    const entryMode = config['node-plugin']?.entryMode;
    const port = server?.port ?? 9000;
    let path = server?.path ?? '';
    let entryContent = readFileSync(entryTemplate, { encoding: 'utf8' });
    entry = entry.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    path = path.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    entryContent = entryContent
        .replace(/{{ entryMode }}/g, entryMode)
        .replace(/{{ entry }}/g, entry)
        .replace(/{{ port }}/g, port)
        .replace(/{{ path }}/g, path);
    await ensureDir(PathUtil.getBackendProjectDistPath());
    const newEntry = join(PathUtil.getBackendProjectDistPath(), 'gen-entry.js');
    writeFileSync(newEntry, entryContent, { encoding: 'utf8' });
    return newEntry;

}

export default async (context: CliContext) => {
    const { pkg, cfg, } = context;
    const props = ConfigUtil.getBackendConfig(cfg);
    if (!props.entry) {
        const config = ConfigUtil.getBackendCellConfig(cfg);
        const entryMode = config['node-plugin']?.entryMode;
        const cwd = process.cwd();
        const mainEntry = pkg.pkg.main;
        if (mainEntry) {
            props.entry = mainEntry;
        } else {
            const entries = [ 'app.ts', 'src/app.ts', 'app.js', 'src/app.js', 'main.ts', 'src/main.ts', 'main.js',
            'src/main.js', 'index.ts', 'src/index.ts', 'index.js', 'src/index.js', 'build/server.js' ];
            for (const entry of entries) {
                const entryPath = join(cwd, entry);
                if (existsSync(entryPath)) {
                    props.entry = entry;
                    break;
                }
            }
        }
        if (props.entry) {
            if (entryMode === 'bundle') {
                props.entry = resolve(cwd, props.entry);
            } else {
                props.entry = props.entry.startsWith('.') ? props.entry : `./${props.entry}`;
            }
        }
    }

    await renderEntry(context);
};
