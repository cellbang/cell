import { BACKEND_TARGET } from '@malagu/cli-common/lib/constants';
import { PropsContext } from '@malagu/cli-common/lib/context/context-protocol';
import { ConfigUtil } from '@malagu/cli-common/lib/utils';
import { existsSync } from 'fs-extra';
import { join, resolve } from 'path';

export default async (context: PropsContext) => {
    const { props, target, pkg, cfg } = context;
    if (target === BACKEND_TARGET) {
        if (!props.entry) {
            const config = ConfigUtil.getBackendMalaguConfig(cfg);
            const entryMode = config['node-plugin']?.entryMode;
            const cwd = process.cwd();
            const mainEntry = pkg.pkg.main;
            if (mainEntry) {
                props.entry = mainEntry;
            } else {
                const entries = [ 'app.ts', 'src/app.ts', 'app.js', 'src/app.js', 'main.ts', 'src/main.ts', 'main.js',
                'src/main.js', 'index.ts', 'src/index.ts', 'index.js', 'src/index.js', 'build/server.js' ];
                for (const entry of entries) {
                    const entryPath = join(cwd, entry)
                    if (existsSync(entryPath)) {
                        props.entry = entry;
                        break;
                    }
                }
            }
            if (entryMode === 'bundle') {
                props.entry = resolve(cwd, props.entry);
            } else {
                props.entry = props.entry.startsWith('.') ? props.entry : `./${props.entry}`;
            }
        }
    }
};
