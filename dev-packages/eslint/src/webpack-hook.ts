import { WebpackContext, getWebpackConfig } from '@malagu/cli';
import { existsSync } from 'fs';
import { join } from 'path';
export default async (context: WebpackContext) => {
    const { pkg, cfg, configurations } = context;
    if (existsSync(join(pkg.projectPath, '.eslintrc.js' )) ||
        existsSync(join(pkg.projectPath, '.eslintrc.yml')) ||
        existsSync(join(pkg.projectPath, '.eslintrc.yaml')) ||
        existsSync(join(pkg.projectPath, '.eslintrc.json')) ||
        existsSync(join(pkg.projectPath, '.eslintrc'))) {
        for (const c of configurations) {
            const ForkTsCheckerNotifierWebpackPlugin = require('fork-ts-checker-notifier-webpack-plugin');
            const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
            const pluginConfig = getWebpackConfig(cfg, c.name!).forkTSCheckerWebpackPlugin || {};
            c.plugins = [
                new ForkTsCheckerWebpackPlugin({ ...{ eslint: true }, ...pluginConfig }),
                new ForkTsCheckerNotifierWebpackPlugin({ title: `TypeScript(${c.name})`, excludeWarnings: false }),
                ...c.plugins
            ];
        }
    }
};
