import { WebpackContext, ConfigUtil } from '@malagu/cli-service';
import { existsSync } from 'fs';
import { join } from 'path';
export default async (context: WebpackContext) => {
    const { cfg, configurations } = context;
    if (existsSync(join(process.cwd(), '.eslintrc.js' )) ||
        existsSync(join(process.cwd(), '.eslintrc.yml')) ||
        existsSync(join(process.cwd(), '.eslintrc.yaml')) ||
        existsSync(join(process.cwd(), '.eslintrc.json')) ||
        existsSync(join(process.cwd(), '.eslintrc'))) {
        for (const config of configurations) {
            const ForkTsCheckerNotifierWebpackPlugin = require('fork-ts-checker-notifier-webpack-plugin');
            const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
            const pluginConfig = ConfigUtil.getWebpackConfig(cfg, config.get('name')).forkTSCheckerWebpackPlugin || {};
            config
                .plugin('tsChecker')
                    .use(ForkTsCheckerWebpackPlugin, [{ ...{ eslint: true }, ...pluginConfig }])
                    .end()
                .plugin('tsCheckerNotifier')
                    .use(ForkTsCheckerNotifierWebpackPlugin, [{ title: `TypeScript(${config.get('name')})`, excludeWarnings: false }]);

        }
    }
};
