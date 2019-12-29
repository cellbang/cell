import { HookContext, BACKEND_TARGET, FRONTEND_TARGET } from '@malagu/cli';
import { resolve } from 'path';
import { writeJSON } from 'fs-extra';

export default async (context: HookContext) => {
    const { pkg, dest, configurations } = context;

    for (const c of configurations) {
        if (c.name === FRONTEND_TARGET) {
            const config = pkg.frontendConfig.malagu['zeit-adapter'].now.config;
            config.name = config.name || `${pkg.pkg.name}-${FRONTEND_TARGET}`;
            const destDir = resolve(pkg.projectPath, dest, FRONTEND_TARGET, 'now.json');
            await writeJSON(destDir, config, { spaces: 2 });
        } else {
            const config = pkg.backendConfig.malagu['zeit-adapter'].now.config;
            config.name = config.name || `${pkg.pkg.name}-${BACKEND_TARGET}`;
            const destDir = resolve(pkg.projectPath, dest, BACKEND_TARGET, 'now.json');
            await writeJSON(destDir, config, { spaces: 2 });
        }
    }
};
