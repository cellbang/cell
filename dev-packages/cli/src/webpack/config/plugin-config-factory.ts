import * as webpack from 'webpack';
import * as path from 'path';
import { CliContext } from '../../context';
import { existsSync, ensureDirSync, writeFileSync, removeSync } from 'fs-extra';
import { getWebpackConfig, getConfig, getHomePath, getMalaguConfig, getDevSuccessInfo } from '../utils';
import { FRONTEND_TARGET, CONFIG_FILE } from '../../constants';
import yaml = require('js-yaml');
const chalk = require('chalk');

export class FilterWarningsPluginConfigFactory {
    create(config: any, context: CliContext, target: string) {
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
            return {
                plugins: [
                    new FilterWarningsPlugin({
                        exclude: [ ...defaultExclude, ...excludeSet]
                    })
                ]
            };
        }
        return {};
    }

    support(context: CliContext, target: string): boolean {
        return true;
    }
}

export class CopyWepackPluginConfigFactory {
    create(config: any, context: CliContext, target: string) {
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

        return {
            plugins: [
                new CopyPlugin(assets.map(assert => ({
                    from: assert,
                    to: path.join(config.output.path, 'assets')
                }))),
            ]
        };
    }

    support(context: CliContext, target: string): boolean {
        return true;
    }
}

export class EnvironmentPluginConfigFactory {
    create(config: any, context: CliContext, target: string) {
        const { cfg, pkg, dev } = context;
        const c = getConfig(cfg, target);
        const homePath = getHomePath(pkg, target);
        ensureDirSync(homePath);
        const configPath = path.join(homePath, CONFIG_FILE);
        if (dev) {
            writeFileSync(configPath, yaml.dump(c), { encoding: 'utf8' });
        } else {
            removeSync(configPath);
        }
        return {
            plugins: [
                new webpack.EnvironmentPlugin({
                    'MALAGU_CONFIG': c
                })
            ]
        };
    }

    support(context: CliContext, target: string): boolean {
        return true;
    }
}

export class HardSourceWebpackPluginConfigFactory {
    create(config: any, context: CliContext, target: string) {
        const { pkg, cfg } = context;
        const homePath = getHomePath(pkg, target);
        const configPath = path.join(homePath, CONFIG_FILE);
        const relativeConfigPath = path.relative(pkg.projectPath, configPath);
        const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
        return {
            plugins: [
                new HardSourceWebpackPlugin({
                    ...{
                        environmentHash: {
                            root: pkg.projectPath,
                            directories: [],
                            files: ['package-lock.json', 'yarn.lock', relativeConfigPath],
                        }
                    },
                    ...getWebpackConfig(cfg, target).hardSourceWebpackPlugin || {}
                })
            ]
        };
    }

    support(context: CliContext, target: string): boolean {
        return true;
    }
}

export class HtmlWebpackPluginConfigFactory {
    create(config: any, context: CliContext, target: string) {
        const { pkg, cfg } = context;
        const faviconPath = path.join(pkg.projectPath, 'favicon.ico');
        const faviconExists = existsSync(faviconPath);
        const templatePath = path.join(pkg.projectPath, 'index.html');
        const templateExists = existsSync(templatePath);
        const HtmlWebpackPlugin = require('html-webpack-plugin');
        const { BaseHrefWebpackPlugin } = require('base-href-webpack-plugin');
        const templatePathBase = path.join(__dirname, '..', '..', '..', 'templates');

        const c = getMalaguConfig(cfg, FRONTEND_TARGET);
        const baseHref = c.server?.path;
        return {
            plugins: [
                new HtmlWebpackPlugin({
                    title: 'Malagu App',
                    template: templateExists ? undefined : path.join(templatePathBase, 'index.html'),
                    favicon: faviconExists ? undefined : path.join(templatePathBase, 'favicon.ico'),
                    templateParameters: getConfig(cfg, FRONTEND_TARGET),
                    ...getWebpackConfig(cfg, FRONTEND_TARGET).htmlWebpackPlugin || {},
                    ...(templateExists ? { template: templatePath } : {}),
                    ...(faviconExists ? { favicon: faviconPath } : {})
                }),
                new BaseHrefWebpackPlugin({ baseHref })
            ]
        };
    }

    support(context: CliContext, target: string): boolean {
        return FRONTEND_TARGET === target;
    }
}

export class HtmlWebpackTagsPluginConfigFactory {
    create(config: any, context: CliContext, target: string) {
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

        return {
            plugins: [
                ...[...after, ...before.reverse()].map(c => new HtmlWebpackTagsPlugin(c))
            ]
        };
    }

    support(context: CliContext, target: string): boolean {
        return FRONTEND_TARGET === target;
    }
}

export class CleanWebpackPluginConfigFactory {
    create(config: any, context: CliContext, target: string) {
        const { CleanWebpackPlugin } = require('clean-webpack-plugin');
        return {
            plugins: [
                new CleanWebpackPlugin()
            ]
        };
    }

    support(context: CliContext, target: string): boolean {
        return true;
    }
}

export class FriendlyErrorsWebpackPluginConfigFactory {
    create(config: any, context: CliContext, target: string) {
        const { dev } = context;
        const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
        return {
            plugins: [
                new FriendlyErrorsWebpackPlugin({
                    compilationSuccessInfo: {
                        messages: dev ? getDevSuccessInfo(config.devServer, target) : [ `The ${target} code output to ${chalk.bold.blue(config.output?.path)}` ],
                        notes: []
                    },
                    clearConsole: dev
                })
            ]
        };
    }

    support(context: CliContext, target: string): boolean {
        return true;
    }
}

export class ProgressPluginConfigFactory {
    create(config: any, context: CliContext, target: string) {
        const ProgressBarPlugin = require('progress-bar-webpack-plugin');

        return {
            plugins: [
                new ProgressBarPlugin({
                    format: `${target} build [:bar] ${chalk.green.bold(':percent')} (:elapsed seconds)`
                })
            ]
        };
    }

    support(context: CliContext, target: string): boolean {
        return process.env.CI !== 'true' && !process.env.VSCODE_PID;
    }
}

export class ToES5PluginConfigFactory {
    create(config: any, context: CliContext, target: string) {
        const { cfg } = context;
        const pluginConfig = getWebpackConfig(cfg, target).toES5Plugin || {};
        const includeConfig = pluginConfig.include || {};
        const includeSet = new Set();
        for (const key in includeConfig) {
            if (includeConfig.hasOwnProperty(key)) {
                const include = includeConfig[key];
                if (include) {
                    includeSet.add(typeof include === 'string' ? new RegExp(include) : include);

                }
            }
        }
        if (includeSet.size) {
            return {
                module: {
                    rules: [
                        {
                            test: /\.js$/,
                            // include only es6 dependencies to transpile them to es5 classes
                            include: {
                                or: [ ...includeSet ]
                            },
                            use: {
                                loader: 'babel-loader',
                                options: {
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
                                }
                            }
                        },
                    ]
                }
            };
        }
        return {};
    }

    support(context: CliContext, target: string): boolean {
        return true;
    }
}
