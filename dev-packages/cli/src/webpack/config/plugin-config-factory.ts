import * as webpack from 'webpack';
import * as path from 'path';
import { HookContext } from '../../context';
import { existsSync, ensureDirSync, writeFileSync } from 'fs-extra';
import { getWebpackConfig, getConfig, getHomePath, getMalaguConfig, getDevSuccessInfo } from '../utils';
import { FRONTEND_TARGET, CONFIG_FILE, BACKEND_TARGET } from '../../constants';
import yaml = require('js-yaml');
const chalk = require('chalk');

export class FilterWarningsPluginConfigFactory {
    create(config: any, context: HookContext, target: string) {
        const { pkg } = context;
        const pluginConfig = getWebpackConfig(pkg, target).filterWarningsPlugin || {};
        const excludeSet = new Set();
        for (const key in pluginConfig) {
            if (pluginConfig.hasOwnProperty(key)) {
                const exclude = pluginConfig[key];
                if (Array.isArray(exclude)) {
                    for (const item of exclude) {
                        excludeSet.add(item);
                    }
                }
            }
        }

        const defaultExclude = target === BACKEND_TARGET ? [/Critical dependency: the request of a dependency is an expression/ ] : [];
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

    support(context: HookContext, target: string): boolean {
        return true;
    }
}

export class CopyWepackPluginConfigFactory {
    create(config: any, context: HookContext, target: string) {
        const { pkg } = context;
        const assets = [];
        for (const assert of (pkg as any)[`${target}Assets`].values()) {
            const p = path.join(pkg.projectPath, 'node_modules', assert);
            if (existsSync(p)) {
                assets.push(p);
            } else if (existsSync(assert)) {
                assets.push(assert);
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

    support(context: HookContext, target: string): boolean {
        return true;
    }
}

export class EnvironmentPluginConfigFactory {
    create(config: any, context: HookContext, target: string) {
        const { pkg } = context;
        const c = getConfig(pkg, target);
        const homePath = getHomePath(pkg, target);
        ensureDirSync(homePath);
        const configPath = path.join(homePath, CONFIG_FILE);
        writeFileSync(configPath, yaml.dump(c), { encoding: 'utf8' });
        return {
            plugins: [
                new webpack.EnvironmentPlugin({
                    'MALAGU_CONFIG': c
                })
            ]
        };
    }

    support(context: HookContext, target: string): boolean {
        return true;
    }
}

export class ForkTsCheckerWebpackPluginConfigFactory {
    create(config: any, context: HookContext, target: string) {
        const { pkg } = context;
        const ForkTsCheckerNotifierWebpackPlugin = require('fork-ts-checker-notifier-webpack-plugin');
        const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

        return {
            plugins: [
                new ForkTsCheckerWebpackPlugin({ ...{ eslint: true }, ...getWebpackConfig(pkg, target).forkTSCheckerWebpackPlugin || {} }),
                new ForkTsCheckerNotifierWebpackPlugin({ title: `TypeScript(${target})`, excludeWarnings: false })
            ]
        };
    }

    support(context: HookContext, target: string): boolean {
        const { pkg } = context;
        if (!existsSync(path.join(pkg.projectPath, '.eslintrc.js'))) {
            return false;
        }
        return true;
    }
}

export class HardSourceWebpackPluginConfigFactory {
    create(config: any, context: HookContext, target: string) {
        const { pkg } = context;
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
                    ...getWebpackConfig(pkg, target).hardSourceWebpackPlugin || {}
                })
            ]
        };
    }

    support(context: HookContext, target: string): boolean {
        return true;
    }
}

export class HtmlWebpackPluginConfigFactory {
    create(config: any, context: HookContext, target: string) {
        const { pkg } = context;
        const faviconPath = path.join(pkg.projectPath, 'favicon.ico');
        const faviconExists = existsSync(faviconPath);
        const templatePath = path.join(pkg.projectPath, 'index.html');
        const templateExists = existsSync(templatePath);
        const HtmlWebpackPlugin = require('html-webpack-plugin');
        const { BaseHrefWebpackPlugin } = require('base-href-webpack-plugin');

        const c = getMalaguConfig(pkg, FRONTEND_TARGET);
        const baseHref = c.server.path;
        return {
            plugins: [
                new HtmlWebpackPlugin({
                    title: 'Malagu App',
                    template: templateExists ? templatePath : path.join(__dirname, '..', '..', '..', 'templates', 'index.html'),
                    templateParameters: getConfig(pkg, FRONTEND_TARGET),
                    favicon: faviconExists ? faviconPath : undefined,
                    ...getWebpackConfig(pkg, FRONTEND_TARGET).htmlWebpackPlugin || {}
                }),
                new BaseHrefWebpackPlugin({ baseHref })
            ]
        };
    }

    support(context: HookContext, target: string): boolean {
        return FRONTEND_TARGET === target;
    }
}

export class WorkboxWebpackPluginConfigFactory {
    create(config: any, context: HookContext, target: string) {
        const { dev, pkg } = context;
        const pluginConfig = { ...getWebpackConfig(pkg, FRONTEND_TARGET).workboxWebpackPlugin || {} };
        const WorkboxWebpackPlugin = require('workbox-webpack-plugin');
        delete pluginConfig.generateInDevMode;
        return {
            plugins: [
                new WorkboxWebpackPlugin.GenerateSW({
                    clientsClaim: true,
                    skipWaiting: true,
                    maximumFileSizeToCacheInBytes: dev ? 10 * 1024 * 1024 : undefined,
                    ...pluginConfig
                })
            ]
        };
    }

    support(context: HookContext, target: string): boolean {
        const { dev, pkg } = context;
        const pluginConfig = getWebpackConfig(pkg, FRONTEND_TARGET).workboxWebpackPlugin || {};
        return FRONTEND_TARGET === target && (!dev || pluginConfig.generateInDevMode);
    }
}

export class HtmlWebpackTagsPluginConfigFactory {
    create(config: any, context: HookContext, target: string) {
        const { pkg } = context;
        const pluginConfig = getWebpackConfig(pkg, FRONTEND_TARGET).htmlWebpackTagsPlugin || {};
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

    support(context: HookContext, target: string): boolean {
        return FRONTEND_TARGET === target;
    }
}

export class CleanWebpackPluginConfigFactory {
    create(config: any, context: HookContext, target: string) {
        const { CleanWebpackPlugin } = require('clean-webpack-plugin');
        return {
            plugins: [
                new CleanWebpackPlugin()
            ]
        };
    }

    support(context: HookContext, target: string): boolean {
        return true;
    }
}

export class FriendlyErrorsWebpackPluginConfigFactory {
    create(config: any, context: HookContext, target: string) {
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

    support(context: HookContext, target: string): boolean {
        return true;
    }
}

export class ProgressPluginConfigFactory {
    create(config: any, context: HookContext, target: string) {
        return {
            plugins: [
                new webpack.ProgressPlugin()
            ]
        };
    }

    support(context: HookContext, target: string): boolean {
        return process.env.CI !== 'true';
    }
}
