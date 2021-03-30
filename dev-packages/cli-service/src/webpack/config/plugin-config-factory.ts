import * as path from 'path';
import { CliContext, getWebpackConfig, getConfig, getHomePath, CONFIG_FILE, FRONTEND_TARGET, getFrontendMalaguConfig } from '@malagu/cli-common';
import { existsSync } from 'fs-extra';
import { getDevSuccessInfo } from '../utils';
const chalk = require('chalk');
import * as WebpackChian from 'webpack-chain';

export class FilterWarningsPluginConfigFactory {
    create(config: WebpackChian, context: CliContext, target: string) {
        const { cfg } = context;
        const pluginConfig = getWebpackConfig(cfg, target).filterWarningsPlugin || {};
        const excludeSet = new Set();
        for (const key in pluginConfig) {
            if (pluginConfig.hasOwnProperty(key)) {
                const exclude = pluginConfig[key];
                if (Array.isArray(exclude)) {
                    for (const item of exclude) {
                        excludeSet.add(new RegExp(item));
                    }
                }
            }
        }

        const defaultExclude =  [/Critical dependency: / ];
        if (defaultExclude.length || excludeSet.size) {
            const FilterWarningsPlugin = require('webpack-filter-warnings-plugin');
            config
                .plugin('fileWarnings')
                    .use(FilterWarningsPlugin, [{
                        exclude: [ ...defaultExclude, ...excludeSet]
                    }]);
        }
    }

    support(context: CliContext, target: string): boolean {
        return true;
    }
}

export class CopyWepackPluginConfigFactory {
    create(config: WebpackChian, context: CliContext, target: string) {
        const { pkg } = context;
        const assets = [];
        for (const assert of (pkg as any)[`${target}Assets`].values()) {
            const p = path.join(pkg.projectPath, 'node_modules', assert);
            if (existsSync(p)) {
                assets.push(p);
            } else if (existsSync(path.resolve(assert))) {
                assets.push(path.resolve(assert));
            }
        }

        if (assets.length === 0) {
            return {};
        }
        const CopyPlugin = require('copy-webpack-plugin');
        config
            .plugin('copy')
                .use(CopyPlugin, [assets.map(assert => ({
                    from: assert,
                    to: path.join(config.output.get('path'), 'assets')
                }))]);
    }

    support(context: CliContext, target: string): boolean {
        return true;
    }
}

export class HardSourceWebpackPluginConfigFactory {
    create(config: WebpackChian, context: CliContext, target: string) {
        const { pkg, cfg } = context;
        const homePath = getHomePath(pkg, target);
        const configPath = path.join(homePath, CONFIG_FILE);
        const relativeConfigPath = path.relative(pkg.projectPath, configPath);
        const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
        config
            .plugin('hardSource')
                .use(HardSourceWebpackPlugin, [{
                    ...{
                        environmentHash: {
                            root: pkg.projectPath,
                            directories: [],
                            files: ['package-lock.json', 'yarn.lock', relativeConfigPath],
                        }
                    },
                    ...getWebpackConfig(cfg, target).hardSourceWebpackPlugin || {}
                }]);
    }

    support(context: CliContext, target: string): boolean {
        return true;
    }
}

export class HtmlWebpackPluginConfigFactory {
    create(config: WebpackChian, context: CliContext, target: string) {
        const { pkg, cfg } = context;
        const faviconPath = path.join(pkg.projectPath, 'favicon.ico');
        const faviconExists = existsSync(faviconPath);
        const templatePath = path.join(pkg.projectPath, 'index.html');
        const templateExists = existsSync(templatePath);
        const HtmlWebpackPlugin = require('html-webpack-plugin');
        const { BaseHrefWebpackPlugin } = require('base-href-webpack-plugin');
        const templatePathBase = path.join(__dirname, '..', '..', '..', 'templates');

        const c = getFrontendMalaguConfig(cfg);
        const baseHref = c.server?.path;

        config
            .plugin('html')
                .use(HtmlWebpackPlugin, [{
                    title: 'Malagu App',
                    template: templateExists ? undefined : path.join(templatePathBase, 'index.html'),
                    favicon: faviconExists ? undefined : path.join(templatePathBase, 'favicon.ico'),
                    templateParameters: getConfig(cfg, FRONTEND_TARGET),
                    ...getWebpackConfig(cfg, FRONTEND_TARGET).htmlWebpackPlugin || {},
                    ...(templateExists ? { template: templatePath } : {}),
                    ...(faviconExists ? { favicon: faviconPath } : {})
                }])
            .end()
            .plugin('baseHref')
                .use(BaseHrefWebpackPlugin, [{ baseHref }]);
    }

    support(context: CliContext, target: string): boolean {
        return FRONTEND_TARGET === target;
    }
}

export class HtmlWebpackTagsPluginConfigFactory {
    create(config: WebpackChian, context: CliContext, target: string) {
        const { cfg } = context;
        const pluginConfig = getWebpackConfig(cfg, FRONTEND_TARGET).htmlWebpackTagsPlugin || {};
        const before = [];
        const after = [];
        for (const key in pluginConfig) {
            if (pluginConfig.hasOwnProperty(key)) {
                let c = pluginConfig[key];
                if (typeof c === 'string') {
                    c = {
                        tags: {
                            path: c,
                            attributes: { crossorigin: true }
                        },
                        append: false
                    };
                }
                if (c.append) {
                    after.push(c);
                } else {
                    before.push(c);
                }
            }
        }

        if (after.length === 0 && before.length === 0) {
            return {};
        }

        const HtmlWebpackTagsPlugin = require('html-webpack-tags-plugin');
        const allConfigs = [...after, ...before.reverse()];
        for (let i = 0; i < allConfigs.length; i++) {
            const c = allConfigs[i];
            config
                .plugin(`htmlTags${i}`)
                    .use(HtmlWebpackTagsPlugin, [c]);
        }
    }

    support(context: CliContext, target: string): boolean {
        return FRONTEND_TARGET === target;
    }
}

export class CleanWebpackPluginConfigFactory {
    create(config: WebpackChian, context: CliContext, target: string) {
        const { CleanWebpackPlugin } = require('clean-webpack-plugin');
        config.plugin('clean').use(CleanWebpackPlugin);
    }

    support(context: CliContext, target: string): boolean {
        return true;
    }
}

export class FriendlyErrorsWebpackPluginConfigFactory {
    create(config: WebpackChian, context: CliContext, target: string) {
        const { dev } = context;
        const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
        config.plugin('friendlyErrors').use(FriendlyErrorsWebpackPlugin, [{
            compilationSuccessInfo: {
                messages: dev ? getDevSuccessInfo(config.devServer, target) : [ `The ${target} code output to ${chalk.bold.blue(config.output.get('path'))}` ],
                notes: []
            },
            clearConsole: dev
        }]);
    }

    support(context: CliContext, target: string): boolean {
        return true;
    }
}

export class ProgressPluginConfigFactory {
    create(config: WebpackChian, context: CliContext, target: string) {
        const ProgressBarPlugin = require('progress-bar-webpack-plugin');
        config.plugin('progressBar').use(ProgressBarPlugin, [{
            format: `${target} build [:bar] ${chalk.green.bold(':percent')} (:elapsed seconds)`
        }]);
    }

    support(context: CliContext, target: string): boolean {
        return process.env.CI !== 'true' && !process.env.VSCODE_PID;
    }
}

export class ToES5PluginConfigFactory {
    create(config: WebpackChian, context: CliContext, target: string) {
        const { cfg } = context;
        const pluginConfig = getWebpackConfig(cfg, target).toES5Plugin || {};
        const includeConfig = pluginConfig.include || {};
        const includeSet = new Set<string | RegExp>();
        for (const key in includeConfig) {
            if (includeConfig.hasOwnProperty(key)) {
                const include = includeConfig[key];
                if (include) {
                    includeSet.add(typeof include === 'string' ? new RegExp(include) : include);

                }
            }
        }
        if (includeSet.size) {
            config
                .module
                    .rule('toES5')
                        .test(/\.js$/)
                        .include
                            .add({
                                or: [ ...includeSet ]
                            })
                        .end()
                        .use('babel-loader')
                            .loader('babel-loader')
                            .options({
                                presets: ['@babel/preset-env'],
                                plugins: [
                                    // reuse runtime babel lib instead of generating it in each js file
                                    '@babel/plugin-transform-runtime',
                                    // ensure that classes are transpiled
                                    '@babel/plugin-transform-classes'
                                ],
                                // see https://github.com/babel/babel/issues/8900#issuecomment-431240426
                                sourceType: 'unambiguous',
                                cacheDirectory: true
                            });
        }
    }

    support(context: CliContext, target: string): boolean {
        return true;
    }
}
