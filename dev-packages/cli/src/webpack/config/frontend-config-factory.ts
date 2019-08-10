import * as path from 'path';
import * as webpack from 'webpack';
import { Context } from './context';
import { FRONTEND_TARGET } from '../../constants';
const HtmlWebpackPlugin = require('html-webpack-plugin');
import mergeWith = require('lodash.mergewith');
import { customizer } from '../../package';

export class FrontendConfigFactory {
    create(context: Context): webpack.Configuration {
        const outputPath = path.resolve(process.cwd(), context.dest, FRONTEND_TARGET);
        const { pkg, open, port } = context;

        let appConfig = { ...pkg.props };
        delete appConfig.backend;
        delete appConfig.frontend;
        appConfig = mergeWith(appConfig, pkg.props.frontend, customizer);
        const entry = pkg.resolveModule(appConfig.entry);
        if (!appConfig.endpoint) {
            appConfig.endpoint = `ws://localhost:${port}/api`;
        }
        return {
            name: FRONTEND_TARGET,
            entry: entry,
            target: 'web',
            stats: 'errors-only',
            node: {
                fs: 'empty',
                child_process: 'empty',
                net: 'empty',
                crypto: 'empty'
            },
            devServer: {
                contentBase: outputPath,
                port,
                open,
                stats: 'errors-only'
            },
            output: {
                path: outputPath,
                filename: '[name].[chunkhash].js'
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
                        test: /\.css$/,
                        exclude: /\.useable\.css$/,
                        loader: 'style-loader!css-loader'
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
                        loader: "url-loader?limit=10000&mimetype=application/font-woff"
                    },
                    {
                        test: /\.wasm$/,
                        loader: "file-loader",
                        type: "javascript/auto",
                    },
                    {
                        test: /\.plist$/,
                        loader: "file-loader",
                    },
                    {
                        test: /malagu([\\/]packages)?[\\/]core[\\/]lib[\\/]common[\\/]dynamic-container\.js$/,
                        use: {
                            loader: 'component-loader',
                            options: {
                                target: 'frontend',
                                modules: Array.from(pkg.frontendModules.values())
                            }
                        }
                    }
                ]
            },
            plugins: [
                new HtmlWebpackPlugin({
                    title: 'Malagu App'
                }),
                new webpack.DefinePlugin({
                    'process.env': JSON.stringify(appConfig)
                })
            ]
        };
    }

    support(context: Context): boolean {
        return context.pkg.frontendModules.size > 0;
    }
}