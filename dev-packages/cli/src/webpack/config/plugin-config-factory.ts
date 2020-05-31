
import * as webpack from 'webpack';
import * as path from 'path';
import { HookContext } from '../../context';
import { existsSync, ensureDirSync, writeFileSync } from 'fs-extra';
import { getWebpackConfig, getConfig, getHomePath } from '../utils';
import { FRONTEND_TARGET, CONFIG_FILE } from '../../constants';
import yaml = require('js-yaml');
const ForkTsCheckerNotifierWebpackPlugin = require('fork-ts-checker-notifier-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
const HtmlWebpackTagsPlugin = require('html-webpack-tags-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

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

        if (!existsSync(path.join(pkg.projectPath, '.eslintrc.js'))) {
            return {};
        }

        return {
            plugins: [
                new ForkTsCheckerWebpackPlugin({ ...{ eslint: true }, ...getWebpackConfig(pkg, target).forkTSCheckerWebpackPlugin || {} }),
                new ForkTsCheckerNotifierWebpackPlugin({ title: `TypeScript(${target})`, excludeWarnings: false })
            ]
        };
    }

    support(context: HookContext, target: string): boolean {
        return true;
    }
}

export class HardSourceWebpackPluginConfigFactory {
    create(config: any, context: HookContext, target: string) {
        const { pkg } = context;
        const homePath = getHomePath(pkg, target);
        const configPath = path.join(homePath, CONFIG_FILE);
        const relativeConfigPath = path.relative(pkg.projectPath, configPath);

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
        return {
            plugins: [
                new HtmlWebpackPlugin({ ...{ title: 'Malagu App' }, ...getWebpackConfig(pkg, FRONTEND_TARGET).htmlWebpackPlugin || {} }),
            ]
        };
    }

    support(context: HookContext, target: string): boolean {
        return FRONTEND_TARGET === target;
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
