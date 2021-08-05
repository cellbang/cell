import { BuildContext, ConfigurationContext, getProjectHomePath, getMalaguConfig } from '@malagu/cli-service';
import { resolve } from 'path';
import { writeJSON } from 'fs-extra';
import * as merge from 'webpack-merge';

export default async (context: BuildContext) => {
    const { cfg, configurations } = context;
    let vercelConfig: any = {};
    for (const c of configurations) {
        const config = getMalaguConfig(cfg, c.get('name')).vercel.config;
        if (ConfigurationContext.isBackendConfiguration(c)) {
            vercelConfig = merge(config, vercelConfig);
        } else {
            vercelConfig = merge(vercelConfig, config);
        }
    }

    if (!ConfigurationContext.hasFrontendConfiguration(configurations)) {
        vercelConfig.routes.push({
            src: '/.*',
            dest: 'backend/dist/index.js'
        });
    }

    const destDir = resolve(getProjectHomePath(), 'vercel.json');
    await writeJSON(destDir, vercelConfig, { spaces: 2 });
};
