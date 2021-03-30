import { WebpackContext, getWebpackConfig } from '@malagu/cli-service';
import { existsSync } from 'fs';
import { join } from 'path';
export default async (context: WebpackContext) => {
    const { pkg, cfg, configurations } = context;
    if (existsSync(join(pkg.projectPath, '.eslintrc.js' )) ||
        existsSync(join(pkg.projectPath, '.eslintrc.yml')) ||
        existsSync(join(pkg.projectPath, '.eslintrc.yaml')) ||
        existsSync(join(pkg.projectPath, '.eslintrc.json')) ||
        existsSync(join(pkg.projectPath, '.eslintrc'))) {
        for (const config of configurations) {
            const ForkTsCheckerNotifierWebpackPlugin = require('fork-ts-checker-notifier-webpack-plugin');
            const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
            const pluginConfig = getWebpackConfig(cfg, config.get('name')).forkTSCheckerWebpackPlugin || {};
            config
                .plugin('tsChecker')
                    .use(ForkTsCheckerWebpackPlugin, [{ ...{ eslint: true }, ...pluginConfig }])
                    .end()
                .plugin('tsCheckerNotifier')
                    .use(ForkTsCheckerNotifierWebpackPlugin, [{ title: `TypeScript(${config.get('name')})`, excludeWarnings: false }]);

        }
    }
};
