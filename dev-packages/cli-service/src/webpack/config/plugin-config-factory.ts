import * as path from 'path';
import { BACKEND_TARGET, FRONTEND_TARGET } from '@celljs/cli-common/lib/constants';
import { CliContext } from '@celljs/cli-common/lib/context/context-protocol';
import { ConfigUtil } from '@celljs/cli-common/lib/utils/config-util';
import { PathUtil } from '@celljs/cli-common/lib/utils/path-util';
import { existsSync } from 'fs-extra';
import { getDevSuccessInfo } from '../utils';
const chalk = require('chalk');
import * as WebpackChain from '@gem-mine/webpack-chain';
import * as Webpack from 'webpack';

export class DefinePluginConfigFactory {

    create(config: WebpackChain, context: CliContext, target: string) {
        const { cfg } = context;
        const pluginConfig = ConfigUtil.getWebpackConfig(cfg, target).definePlugin;
        if (pluginConfig) {
            config
                .plugin('define')
                    .use(Webpack.DefinePlugin, [ pluginConfig ]);
        }
    }

    support(context: CliContext, target: string): boolean {
        return true;
    }
}

export class FilterWarningsPluginConfigFactory {
    create(config: WebpackChain, context: CliContext, target: string) {
        const { cfg } = context;
        const pluginConfig = ConfigUtil.getWebpackConfig(cfg, target).filterWarningsPlugin || {};
        const excludeSet = new Set();
        for (const [, exclude] of Object.entries(pluginConfig)) {
            if (Array.isArray(exclude)) {
                for (const item of exclude) {
                    excludeSet.add(new RegExp(item));
                }
            }
        }

        const defaultExclude = [
            /Critical dependency: /,
            /Cannot find source file/,
            /Module not found: Error: Can't resolve 'bufferutil'/,
            /Module not found: Error: Can't resolve 'utf-8-validate'/
        ];
        if (defaultExclude.length || excludeSet.size) {
            const excludeReg = [...defaultExclude, ...excludeSet];
            const messageReg: any = [];
            excludeReg.forEach(reg => {
                if (reg instanceof RegExp) {
                    messageReg.push({
                        message: reg
                    });
                }
            });
            config.ignoreWarnings(messageReg);
        }
    }

    support(context: CliContext, target: string): boolean {
        return true;
    }
}

export class CopyWebpackPluginConfigFactory {
    create(config: WebpackChain, context: CliContext, target: string) {
        const { cfg } = context;
        const pluginConfig = ConfigUtil.getWebpackConfig(cfg, target).copyPlugin || {};
        if (Object.keys(pluginConfig).length === 0) {
            return;
        }

        const CopyPlugin = require('copy-webpack-plugin');
        config
            .plugin('copy')
                .use(CopyPlugin, [pluginConfig]);
    }

    support(context: CliContext, target: string): boolean {
        return true;
    }
}

export class AssetsPluginConfigFactory {
    create(config: WebpackChain, context: CliContext, target: string) {
        const { pkg } = context;
        const assets = [];
        for (const assert of ConfigUtil.getAssets(pkg, target)) {
            assets.push(assert.path);
        }

        if (assets.length === 0) {
            return {};
        }
        const CopyPlugin = require('copy-webpack-plugin');
        config
            .plugin('assets')
                .use(CopyPlugin, [{
                    patterns: assets.map(assert => ({
                        from: assert,
                        to: path.join(config.output.get('path'), 'assets')
                    }))
                }]);
    }

    support(context: CliContext, target: string): boolean {
        return true;
    }
}

export class HtmlWebpackPluginConfigFactory {
    create(config: WebpackChain, context: CliContext, target: string) {
        const { cfg } = context;
        const faviconPath = path.join(process.cwd(), 'favicon.ico');
        const faviconExists = existsSync(faviconPath);
        const templatePath = path.join(process.cwd(), 'index.html');
        const templateExists = existsSync(templatePath);
        const HtmlWebpackPlugin = require('html-webpack-plugin');
        const templatePathBase = path.join(__dirname, '..', '..', '..', 'templates');

        const c = ConfigUtil.getFrontendCellConfig(cfg);
        const baseHref = c.server?.path;

        config
            .plugin('html')
                .use(HtmlWebpackPlugin, [{
                    title: 'Cell App',
                    template: templateExists ? undefined : path.join(templatePathBase, 'index.html'),
                    favicon: faviconExists ? undefined : path.join(templatePathBase, 'favicon.ico'),
                    templateParameters: ConfigUtil.getConfig(cfg, FRONTEND_TARGET),
                    base: { href: baseHref },
                    ...ConfigUtil.getWebpackConfig(cfg, FRONTEND_TARGET).htmlWebpackPlugin || {},
                    ...(templateExists ? { template: templatePath } : {}),
                    ...(faviconExists ? { favicon: faviconPath } : {})
                }])
            .end();
    }

    support(context: CliContext, target: string): boolean {
        return FRONTEND_TARGET === target;
    }
}

export class HtmlWebpackTagsPluginConfigFactory {
    create(config: WebpackChain, context: CliContext, target: string) {
        const { cfg } = context;
        const pluginConfig = ConfigUtil.getWebpackConfig(cfg, FRONTEND_TARGET).htmlWebpackTagsPlugin || {};
        const before = [];
        const after = [];
        for (const [, item] of Object.entries<any>(pluginConfig)) {
            let c = item;
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
    create(config: WebpackChain, context: CliContext, target: string) {
        const { CleanWebpackPlugin } = require('clean-webpack-plugin');
        config.plugin('clean').use(CleanWebpackPlugin);
    }

    support(context: CliContext, target: string): boolean {
        return true;
    }
}

export class NormalModuleReplacementPluginConfigFactory {
    create(config: WebpackChain, context: CliContext, target: string) {
        const { cfg } = context;
        const pluginConfig = ConfigUtil.getWebpackConfig(cfg, FRONTEND_TARGET).moduleReplacementPlugin || {};

        const resources = [
            '\\node_modules\\@celljs\\',
            '/node_modules/@celljs/',
            ...(pluginConfig.resources ?? [])
        ];
        const runtimePath = PathUtil.getRuntimePath(context.runtime);
        config
            .plugin('replace')
            .use(Webpack.NormalModuleReplacementPlugin, [ new RegExp(runtimePath.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')), data => {
                const createData = data.createData;
                const resource = createData.resource;
                if (resource?.startsWith(runtimePath)) {
                    const isExist = resources.some(r => {
                        if (typeof r === 'string') {
                            return resource.includes(r);
                        } else if (r instanceof RegExp) {
                            return r.test(resource);
                        }
                    });
                    if (isExist) {
                        let processPath = process.cwd();
                        let newResource = resource.replace(runtimePath, processPath);
                        while (!existsSync(newResource) && processPath !== path.parse(process.cwd()).root) {
                            processPath = path.resolve(processPath, '..');
                            newResource = resource.replace(runtimePath, processPath);
                        }
                        if (existsSync(newResource)) {

                            if (createData.request && createData.userRequest) {
                                createData.request = createData.request.replace(runtimePath, processPath);
                                createData.userRequest = createData.userRequest.replace(runtimePath, processPath);
                                createData.resource = newResource;
                                createData.context = createData.context?.replace(runtimePath, processPath);
                            }
                        }
                    }
                }
            }]);
    }

    support(context: CliContext, target: string): boolean {
        return target === BACKEND_TARGET;
    }
}

export class FriendlyErrorsWebpackPluginConfigFactory {
    create(config: WebpackChain, context: CliContext, target: string) {
        const { dev } = context;
        const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-malagu');
        config.plugin('friendlyErrors').use(FriendlyErrorsWebpackPlugin, [{
            compilationSuccessInfo: {
                messages: dev ? getDevSuccessInfo(config.devServer, target) : [`The ${target} code output to ${chalk.bold.blue(config.output.get('path'))} 🎉`],
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
    create(config: WebpackChain, context: CliContext, target: string) {
        const ProgressBarPlugin = require('progress-bar-webpack-plugin');
        config.plugin('progressBar').use(ProgressBarPlugin, [{
            format: `${target} build [:bar] ${chalk.green.bold(':percent')} (:elapsed seconds)`
        }]);
    }

    support(context: CliContext, target: string): boolean {
        return process.env.CI !== 'true' && !process.env.VSCODE_PID;
    }
}

export class NodePolyfillPluginConfigFactory {
    create(config: WebpackChain, context: CliContext, target: string) {
        const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
        config.plugin('nodePolyfill').use(NodePolyfillPlugin);
    }

    support(context: CliContext, target: string): boolean {
        return target === FRONTEND_TARGET;
    }
}
