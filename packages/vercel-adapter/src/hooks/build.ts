import { BuildContext, ConfigurationContext, getHomePath, getMalaguConfig, BACKEND_TARGET, FRONTEND_TARGET } from '@malagu/cli';
import { resolve } from 'path';
import { writeJSON } from 'fs-extra';
import * as merge from 'webpack-merge';

export default async (context: BuildContext) => {
    const { pkg, configurations } = context;
    let vercelConfig: any = {};
    for (const c of configurations) {
        const config = getMalaguConfig(pkg, c.name!).vercel.config;
        if (c.name === BACKEND_TARGET) {
            vercelConfig = merge(config, vercelConfig);
        } else {
            vercelConfig = merge(vercelConfig, config);
        }
    }

    if (!ConfigurationContext.getConfiguration(FRONTEND_TARGET, configurations)) {
        vercelConfig.routes.push({
            src: '/.*',
            dest: 'backend/dist/index.js'
        });
    }

    const destDir = resolve(getHomePath(pkg), 'vercel.json');
    await writeJSON(destDir, vercelConfig, { spaces: 2 });
};
