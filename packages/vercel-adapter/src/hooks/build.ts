import { BuildContext, FRONTEND_TARGET, BACKEND_TARGET, ConfigUtil, PathUtil } from '@malagu/cli-common';
import { resolve } from 'path';
import { writeJSON } from 'fs-extra';

export default async (context: BuildContext) => {
    const { cfg, runtime } = context;
    let vercelConfig: any = {};

    if (ConfigUtil.support(cfg, FRONTEND_TARGET)) {
        const config = ConfigUtil.getFrontendMalaguConfig(cfg).vercel.config;
        vercelConfig = ConfigUtil.merge(vercelConfig, config);
    } else {
        vercelConfig.routes.push({
            src: '/.*',
            dest: 'backend/index.js'
        });
    }

    if (ConfigUtil.support(cfg, BACKEND_TARGET)) {
        const config = ConfigUtil.getFrontendMalaguConfig(cfg).vercel.config;
        vercelConfig = ConfigUtil.merge(config, vercelConfig);
    }

    const configPath = resolve(PathUtil.getProjectDistPath(runtime), 'vercel.json');
    await writeJSON(configPath, vercelConfig, { spaces: 2 });
};
