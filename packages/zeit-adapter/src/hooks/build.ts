import { BuildContext, ConfigurationContext, getHomePath, getMalaguConfig, BACKEND_TARGET, FRONTEND_TARGET } from '@malagu/cli';
import { resolve } from 'path';
import { writeJSON } from 'fs-extra';
import * as merge from 'webpack-merge';

export default async (context: BuildContext) => {
    const { pkg, configurations } = context;
    let nowConfig: any = {};
    for (const c of configurations) {
        const config = getMalaguConfig(pkg, c.name!)['zeit-adapter'].now.config;
        if (c.name === BACKEND_TARGET) {
            nowConfig = merge(config, nowConfig);
        } else {
            nowConfig = merge(nowConfig, config);
        }
    }

    if (!ConfigurationContext.getConfiguration(FRONTEND_TARGET, configurations)) {
        nowConfig.routes.push({
            src: '/.*',
            dest: 'backend/dist/index.js'
        });
    }

    const destDir = resolve(getHomePath(pkg), 'now.json');
    await writeJSON(destDir, nowConfig, { spaces: 2 });
};
