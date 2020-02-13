import * as path from 'path';
import * as webpack from 'webpack';
import * as merge from 'webpack-merge';
import { CliContext } from '../../context';
import { FRONTEND_TARGET } from '../../constants';
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ForkTsCheckerNotifierWebpackPlugin = require('fork-ts-checker-notifier-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

export class FrontendConfigFactory {

    private _config: any;

    getConfig(context: CliContext) {
        if (this._config) {
            return this._config;
        }
        const { pkg, port } = context;
        this._config = pkg.frontendConfig;
        const endpoint = this._config.malagu && this._config.malagu.server.endpoint;
        const p = port || this._config.malagu && this._config.malagu.server.port;
        if (endpoint) {
            this._config.malagu.server.endpoint = endpoint.replace('{port}', p);
        }
        return this._config;
    }

    create(context: CliContext): webpack.Configuration {
        const { pkg, open, port, dest } = context;
        const outputPath = path.resolve(pkg.projectPath, dest || 'dist', FRONTEND_TARGET);

        const config = this.getConfig(context);
        const webpackConfig = config.webpack || {};
        let entry = pkg.resolveModule(config.entry);
        const type = config.deployConfig ? config.deployConfig.type : undefined;
        if (type && typeof entry !== 'string') {
            entry = entry[type];
        }
        return merge(<webpack.Configuration>{
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
                contentBase: false,
                port: port || this._config.malagu && this._config.malagu.server.port,
                open
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
                        loader: 'url-loader?limit=10000&mimetype=application/font-woff'
                    },
                    {
                        test: /\.wasm$/,
                        loader: 'file-loader',
                        type: 'javascript/auto',
                    },
                    {
                        test: /\.plist$/,
                        loader: 'file-loader',
                    },
                    {
                        test: /core[\\/]lib[\\/]common[\\/]container[\\/]dynamic-container\.js$/,
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
                new HtmlWebpackPlugin({ ...{ title: 'Malagu App' }, ...webpackConfig.htmlWebpackPlugin }),
                new webpack.EnvironmentPlugin({
                    'MALAGU_CONFIG': config
                }),
                new ForkTsCheckerWebpackPlugin({ ...{ tslint: true }, ...webpackConfig.forkTSCheckerWebpackPlugin }),
                new ForkTsCheckerNotifierWebpackPlugin({ title: 'TypeScript', excludeWarnings: false }),
            ]
        }, config.malagu.webpack ? config.malagu.webpack.config : {});
    }

    support(context: CliContext): boolean {
        const config = this.getConfig(context);
        return context.pkg.frontendModules.size > 0 && (!config.targets || config.targets.includes(FRONTEND_TARGET));
    }
}
