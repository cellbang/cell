
import { HookContext } from '../../context';
import { BACKEND_TARGET } from '../../constants';
const TerserPlugin = require('terser-webpack-plugin');
const nodeExternals = require('webpack-node-externals');
import * as merge from 'webpack-merge';
import * as path from 'path';

export class BaseConfigFactory {

    create(config: any, context: HookContext, target: string) {
        const { dev, pkg } = context;
        const webpackMode = dev ? 'development' : 'production';
        const baseConfig = {
            name: target,
            mode: webpackMode,
            optimization: {
                minimize: !dev,
                minimizer: [
                    new TerserPlugin({
                        parallel: true,
                        terserOptions: {
                            keep_classnames: true,
                            keep_fnames: true
                        },
                        extractComments: false
                    })
                ]
            },
            devtool: dev ? 'eval-cheap-source-map' : undefined,
            stats: 'errors-only',
            resolve: {
                extensions: [ '.tsx', '.ts', '.js' ]
            },
            module: {
                rules: [
                    {
                        test: /\.js$/,
                        enforce: 'pre',
                        use: [{loader: 'source-map-loader'}],
                        exclude: /jsonc-parser/
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
                stats: 'errors-only',
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
                            test: /\.css$/,
                            exclude: /\.useable\.css$/,
                            use: [
                                'style-loader',
                                'css-loader'
                            ]
                        },
                        {
                            test: /\.useable\.css$/,
                            use: [
                                'style-loader/useable',
                                'css-loader'
                            ]
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

    support(context: HookContext, target: string): boolean {
        return true;
    }
}
