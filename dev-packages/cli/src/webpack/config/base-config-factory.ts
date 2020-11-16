
import { CliContext } from '../../context';
import { BACKEND_TARGET } from '../../constants';
const TerserPlugin = require('terser-webpack-plugin');
const nodeExternals = require('webpack-node-externals');
import * as merge from 'webpack-merge';
import * as path from 'path';

export class BaseConfigFactory {

    create(config: any, context: CliContext, target: string) {
        const { dev, pkg } = context;
        const webpackMode = dev ? 'development' : 'production';
        const baseConfig = {
            name: target,
            mode: webpackMode,
            optimization: {
                minimize: !dev
            },
            devtool: dev ? 'source-map' : false,
            stats: 'minimal',
            resolve: {
                extensions: [ '.tsx', '.ts', '.js', '.wasm', '.mjs', '.json' ]
            },
            module: {
                rules: [
                    {
                        test: /\.js$/,
                        enforce: 'pre',
                        use: 'source-map-loader',
                        exclude: /jsonc-parser|class-transformer/
                    },
                    {
                        test: /\.tsx?$/,
                        use: [{
                            loader: 'ts-loader',
                            options: {
                                transpileOnly: true,
                                experimentalWatchApi: true
                            },
                        }],
                        exclude: /node_modules/
                    }
                ]
            }
        };
        if (BACKEND_TARGET === target) {
            const whitelist = pkg.componentPackages.map(cp => new RegExp(cp.name));
            return merge(baseConfig as any, {
                target: 'node',
                externals: dev ? [nodeExternals({
                    whitelist,
                    modulesDir: path.resolve(pkg.projectPath, '../node_modules')
                }), nodeExternals({
                    whitelist
                }), nodeExternals({
                    whitelist,
                    modulesDir: path.resolve(pkg.projectPath, '../../node_modules')
                })] : undefined,
                node: {
                    __dirname: false,
                    __filename: false
                },
                optimization: {
                    minimizer: [
                        new TerserPlugin({
                            terserOptions: {
                                output: {
                                    comments: false,
                                },
                                keep_classnames: true,
                                keep_fnames: true
                            },
                            extractComments: false
                        })
                    ]
                },
                devtool: 'source-map',
            });
        } else {
            return merge(baseConfig as any, {
                target: 'web',
                node: {
                    fs: 'empty',
                    child_process: 'empty',
                    net: 'empty',
                    crypto: 'empty'
                },
                performance: {
                    hints: false
                },
                optimization: {
                    minimizer: [
                        new TerserPlugin({
                            terserOptions: {
                                output: {
                                    comments: false,
                                }
                            },
                            extractComments: false
                        })
                    ]
                },
                module: {
                    rules: [
                        {
                            test: /worker-main\.js$/,
                            loader: 'worker-loader',
                            options: {
                                name: 'worker-ext.[hash].js'
                            }
                        },
                        {
                            test: /\.(jpg|png|gif)$/,
                            loader: 'file-loader',
                            options: {
                                name: '[hash].[ext]',
                            }
                        },
                        {
                            test: /source-map-support/,
                            loader: 'ignore-loader'
                        },
                        {
                            test: /\.(ttf|eot|svg)(\\?v=\\d+\\.\\d+\\.\\d+)?$/,
                            loader: 'url-loader?limit=10000&mimetype=image/svg+xml'
                        },
                        {
                            test: /\.woff(2)?(\\?v=[0-9]\.[0-9]\.[0-9])?$/,
                            loader: 'url-loader',
                            options: {
                                limit: 10000,
                                mimetype: 'application/font-woff'
                            }
                        },
                        {
                            test: /\.wasm$/,
                            loader: 'file-loader',
                            type: 'javascript/auto',
                        },
                        {
                            test: /\.plist$/,
                            loader: 'file-loader',
                        }
                    ]
                }
            });
        }
    }

    support(context: CliContext, target: string): boolean {
        return true;
    }
}
