import { BACKEND_TARGET, PropsContext } from '@malagu/cli-common';
import { existsSync } from 'fs-extra';
import { join } from 'path';

export default async (context: PropsContext) => {
    const { props, target } = context;
    const cwd = process.cwd();
    const entries = [ 'app.ts', 'src/app.ts', 'app.js', 'src/app.ts', 'index.ts', 'src/index.ts', 'index.js', 'src/index.js' ]
    if (target === BACKEND_TARGET) {
        if (!props.entry) {
            for (const entry of entries) {
                if (existsSync(join(cwd, entry))) {
                    props.entry = join(cwd, entry);
                    break;
                }
            }
            
        }
    }
};
