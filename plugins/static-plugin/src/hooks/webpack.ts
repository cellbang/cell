import { ConfigurationContext, WebpackContext, PathUtil, ConfigUtil } from '@malagu/cli-service';
import { resolve } from 'path';
const rimraf = require('rimraf');

export default async (context: WebpackContext) => {
    const { configurations , cfg } = context;
    const config = ConfigurationContext.getBackendConfiguration(
        configurations
    );
    const projectHomePath = PathUtil.getProjectHomePath();
    if (config && !projectHomePath.startsWith(process.cwd())) {
        const outputDir = ConfigUtil.getFrontendConfig(cfg).outputDir;
        if (outputDir) {
            const CopyPlugin = require('copy-webpack-plugin');
            const to = PathUtil.getFrontendProjectDistPath();
            rimraf.sync(to);
            config
                .plugin('copyFrontend')
                .use(CopyPlugin, [{
                    patterns: [{
                        from: resolve(process.cwd(), outputDir),
                        to
                    }]
                }]);
        }

    }
};
