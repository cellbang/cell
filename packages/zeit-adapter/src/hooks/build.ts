import { HookContext, getHomePath, getMalaguConfig } from '@malagu/cli';
import { resolve } from 'path';
import { writeJSON } from 'fs-extra';

export default async (context: HookContext) => {
    const { pkg, configurations } = context;

    for (const c of configurations) {
        const config = getMalaguConfig(pkg, c.name!)['zeit-adapter'].now.config;
        config.name = config.name || `${pkg.pkg.name}-${c.name}`;
        const destDir = resolve(getHomePath(pkg, c.name!), 'now.json');
        await writeJSON(destDir, config, { spaces: 2 });
    }
};
