import { ConfigurationContext, WebpackContext, PathUtil, ConfigUtil } from '@malagu/cli-service';
import { resolve } from 'path';
const rimraf = require('rimraf');
const chalk = require('chalk');

export default async (context: WebpackContext) => {
    const { configurations , cfg } = context;
    const config = ConfigurationContext.getBackendConfiguration(
        configurations
    );
    if (config) {
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
                        to,
                        globOptions: {
                            ignore: [`${PathUtil.getProjectHomePath()}/**`, `${PathUtil.getProjectDistPath()}/**`],
                        },
                    }]
                }]);
            console.log(`💰 The backend code output to ${chalk.bold.blue(to)} 🎉`);
        }

    }
};
