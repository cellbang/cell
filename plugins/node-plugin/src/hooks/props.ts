import { BACKEND_TARGET, PropsContext } from '@malagu/cli-common';
import { existsSync } from 'fs-extra';
import { join } from 'path';

export default async (context: PropsContext) => {
    const { props, target, pkg } = context;
    if (target === BACKEND_TARGET && !props.entry) {
        const mainEntry = pkg.pkg.main;
        if (mainEntry) {
            props.entry = mainEntry;
            return;
        }
        const cwd = process.cwd();
        const entries = [ 'app.ts', 'src/app.ts', 'app.js', 'src/app.js', 'main.ts', 'src/main.ts', 'main.js', 'src/main.js', 'index.ts', 'src/index.ts', 'index.js', 'src/index.js' ]
        for (const entry of entries) {
            const entryPath = join(cwd, entry)
            if (existsSync(entryPath)) {
                props.entry = entryPath;
                return;
            }
        }
    }
};
