import { ConfigurationContext, WebpackContext } from '@celljs/cli-service/lib/context/context-protocol';
import { PathUtil } from '@celljs/cli-common/lib/utils/path-util';
import { ConfigUtil } from '@celljs/cli-common/lib/utils/config-util';

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
            console.log(`💰 The frontend code output to ${chalk.bold.blue(to)} 🎉`);
        }

    }
};
