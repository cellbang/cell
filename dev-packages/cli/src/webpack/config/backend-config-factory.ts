
import * as webpack from 'webpack';
import * as path from 'path';
import * as merge from 'webpack-merge';
import { CliContext } from '../../context';
import { BACKEND_TARGET } from '../../constants';
import { existsSync } from 'fs-extra';
const nodeExternals = require('webpack-node-externals');
const ForkTsCheckerNotifierWebpackPlugin = require('fork-ts-checker-notifier-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

export class BackendConfigFactory {
    create(context: CliContext): webpack.Configuration {
        const { pkg, port, open, dest, dev } = context;
        const outputPath = path.resolve(pkg.projectPath, dest || 'dist', BACKEND_TARGET);

        const config = pkg.backendConfig;
        const webpackConfig = config.malagu.webpack || {};
        let entry: any = config.entry;
        const type = config.deployConfig ? config.deployConfig.type : undefined;
        if (type && entry && typeof entry !== 'string') {
            entry = entry[type];
        }
        entry = pkg.resolveModule(entry.split(path.sep).join('/'));

        const assets = [];
        for (const assert of pkg.backendAssets.values()) {
            const p = path.join(pkg.projectPath, 'node_modules', assert);
            if (existsSync(p)) {
                assets.push(p);
            } else if (existsSync(assert)) {
                assets.push(assert);
            }
        }

        return merge(<webpack.Configuration>{
            name: BACKEND_TARGET,
            entry: entry,
            target: 'node',
            node: {
                __dirname: false,
                __filename: false
            },
            externals: dev ? [nodeExternals({
                whitelist: pkg.componentPackages.map(cp => new RegExp(cp.name))
            })] : undefined,
            devtool: 'source-map',
            output: {
                path: outputPath,
                filename: 'index.js',
                libraryTarget: 'umd',
                devtoolModuleFilenameTemplate: '[absolute-resource-path]'
            },
            devServer: {
                port: port || config.malagu && config.malagu.server.port,
                open,
                writeToDisk: true,
                contentBase: false
            },
            plugins: [
                new webpack.EnvironmentPlugin({
                    'MALAGU_CONFIG': config
                }),
                new ForkTsCheckerWebpackPlugin({ ...{ eslint: true }, ...webpackConfig.forkTSCheckerWebpackPlugin }),
                new ForkTsCheckerNotifierWebpackPlugin({ title: 'TypeScript', excludeWarnings: false }),
                new CopyPlugin(assets.map(assert => ({
                    from: assert,
                    to: path.join(outputPath, 'assets')
                })))
            ],
            module: {
                rules: [
                    {
                        test: /core[\\/]lib[\\/]common[\\/]container[\\/]dynamic-container\.js$/,
                        use: {
                            loader: 'component-loader',
                            options: {
                                target: 'backend',
                                modules: Array.from(pkg.backendModules.values())
                            }
                        }
                    },
                ]
            }
        }, webpackConfig ? webpackConfig.config : {});
    }

    support(context: CliContext): boolean {
        const { pkg: { backendConfig } } = context;
        const config = backendConfig;

        return context.pkg.backendModules.size > 0 && (!config.targets || config.targets.includes(BACKEND_TARGET));
    }
}
