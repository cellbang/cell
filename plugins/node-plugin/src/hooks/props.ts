import { BACKEND_TARGET } from '@malagu/cli-common/lib/constants';
import { PropsContext } from '@malagu/cli-common/lib/context/context-protocol';
import { existsSync } from 'fs-extra';
import { join, resolve } from 'path';

export default async (context: PropsContext) => {
    const { props, target, pkg } = context;
    if (target === BACKEND_TARGET) {
        if (!props.entry) {
            const cwd = process.cwd();
            const mainEntry = pkg.pkg.main;
            if (mainEntry) {
                props.entry = resolve(cwd, mainEntry);
            } else {
                const entries = [ 'app.ts', 'src/app.ts', 'app.js', 'src/app.js', 'main.ts', 'src/main.ts', 'main.js',
                'src/main.js', 'index.ts', 'src/index.ts', 'index.js', 'src/index.js' ];
                for (const entry of entries) {
                    const entryPath = join(cwd, entry)
                    if (existsSync(entryPath)) {
                        props.entry = entryPath;
                        break;
                    }
                }
            }
        }
    }
};
