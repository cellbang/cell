import { BACKEND_TARGET, PathUtil, PropsContext, ConfigUtil } from '@malagu/cli-common';
import { existsSync, readFileSync, writeFileSync } from 'fs-extra';
import { join, resolve } from 'path';

export default async (context: PropsContext) => {
    const { props, target, pkg, cfg } = context;
    if (target === BACKEND_TARGET && !props.entry && existsSync(PathUtil.getProjectHomePath())) {
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
        const server = ConfigUtil.getBackendMalaguConfig(cfg).server;
        const port = server?.port ?? 9000;
        const path = server?.path ?? '';
        const isLambda = pkg.componentPackages.some(c => c.name === '@malagu/lambda-plugin');
        let entryContent = readFileSync(join(__dirname, '..', isLambda ? 'lambda-entry.js' : 'entry.js'), { encoding: 'utf8' });
        entryContent = entryContent
            .replace(/{{ entry }}/g, props.entry)
            .replace(/{{ port }}/g, port)
            .replace(/{{ path }}/g, path)
        props.entry = join(PathUtil.getProjectHomePath(), 'entry.js');
        writeFileSync(props.entry, entryContent, { encoding: 'utf8' });

    }
};
