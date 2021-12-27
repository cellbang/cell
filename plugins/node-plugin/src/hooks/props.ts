import { BACKEND_TARGET } from '@malagu/cli-common/lib/constants';
import { PathUtil } from '@malagu/cli-common/lib/utils/path-util';
import { PropsContext } from '@malagu/cli-common/lib/context/context-protocol';
import { ConfigUtil } from '@malagu/cli-common/lib/utils/config-util';
import { CommandUtil } from '@malagu/cli-common/lib/utils/command-util';
import { existsSync, readFileSync, writeFileSync, ensureDir } from 'fs-extra';
import { join, resolve } from 'path';
import { ApplicationConfig } from '@malagu/cli-common/lib/package/application-config';

function renderEntry(entryTemplate: string, cfg: ApplicationConfig, entry: string) {
    ensureDir(PathUtil.getProjectHomePath());
    const server = ConfigUtil.getBackendMalaguConfig(cfg).server;
    const port = server?.port ?? 9000;
    const path = server?.path ?? '';
    let entryContent = readFileSync(entryTemplate, { encoding: 'utf8' });
    entryContent = entryContent
        .replace(/{{ entry }}/g, entry)
        .replace(/{{ port }}/g, port)
        .replace(/{{ path }}/g, path);
    const newEntry = join(PathUtil.getProjectHomePath(), 'entry.js');
    writeFileSync(newEntry, entryContent, { encoding: 'utf8' });
    return newEntry;

}

export default async (context: PropsContext) => {
    const { props, target, pkg, cfg, dev } = context;
    if (target === BACKEND_TARGET && !props.entry) {
        const cwd = process.cwd();
        const mainEntry = pkg.pkg.main;
        if (mainEntry) {
            props.entry = resolve(cwd, mainEntry);
        } else {
            const entries = [ 'app.ts', 'src/app.ts', 'app.js', 'src/app.js', 'main.ts', 'src/main.ts', 'main.js', 'src/main.js', 'index.ts', 'src/index.ts', 'index.js', 'src/index.js' ]
            for (const entry of entries) {
                const entryPath = join(cwd, entry)
                if (existsSync(entryPath)) {
                    props.entry = entryPath;
                    break;
                }
            }
        }
        if (dev) {
            const entryTemplate = join(__dirname, '..', 'entry.js');
            props.entry = renderEntry(entryTemplate, cfg, props.entry);
        } else if (CommandUtil.includesCommand(context.args, [ 'build', 'deploy' ])) {
            const isLambda = pkg.componentPackages.some(c => c.name === '@malagu/lambda-plugin');
            const isFastify = pkg.framework?.name === 'fastify';
            const entryTemplate = join(__dirname, '..', isLambda ? (isFastify ? 'lambda-fastify-entry.js' :'lambda-entry.js') : 'entry.js');
            props.entry = renderEntry(entryTemplate, cfg, props.entry);
        } else {
            props.entry = join(PathUtil.getProjectHomePath(), 'entry.js');
        }
    }
};
