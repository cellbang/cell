
import { BACKEND_TARGET, CliContext, ConfigUtil } from '@malagu/cli-common';
const TerserPlugin = require('terser-webpack-plugin');
const nodeExternals = require('webpack-node-externals');
import * as path from 'path';
import webpack = require('webpack');
import * as WebpackChain from 'webpack-chain';

export class BaseConfigFactory {

    create(config: WebpackChain, context: CliContext, target: string) {
        const { dev, pkg, cfg } = context;
        const sourceMapLoader = ConfigUtil.getWebpackConfig(cfg, target).sourceMapLoader || {};
        let sourceMapLoaderExclude = sourceMapLoader.exclude || {};
        sourceMapLoaderExclude = Object.keys(sourceMapLoaderExclude).map(key => sourceMapLoaderExclude[key]);
        sourceMapLoaderExclude = new RegExp(sourceMapLoaderExclude.join('|'));
        const webpackMode = dev ? 'development' : 'production';
        config
            .name(target)
            .mode(webpackMode)
            .optimization
                .minimize(!dev)
                .minimizer('terser')
                    .use(TerserPlugin, [{
                        terserOptions: {
                            output: {
                                comments: false,
                            },
                            keep_classnames: true,
                            keep_fnames: true
                        },
                        extractComments: false
                    }])
                .end()
            .end()
            .stats('errors-only')
            .merge({
                infrastructureLogging: {
                    level: 'error',
                },
                devtool:  dev ? 'eval-cheap-module-source-map' : false
            })
            .resolve
                .extensions
                    .merge([ '.js', '.ts', '.tsx', '.wasm', '.mjs', '.json' ])
                .end()
            .end()
            .module
                .rule('js')
                    .test(/\.js$/)
                    .enforce('pre')
                    .use('source-map-loader')
                        .loader('source-map-loader')
                    .end()
                    .exclude
                        .add(sourceMapLoaderExclude)
                    .end()
                .end()
                .rule('ts')
                    .test( /\.tsx?$/)
                    .use('ts-loader')
                        .loader('ts-loader')
                        .options({
                            transpileOnly: true,
                            experimentalWatchApi: true
                        })
                    .end()
                    .exclude
                        .add(/node_modules/)
                    .end();

        if (target === BACKEND_TARGET) {
            const allowlist = pkg.componentPackages.map(cp => new RegExp(cp.name));
            config
                .target('node')
                .externals(dev ? [nodeExternals({
                    allowlist,
                    modulesDir: path.resolve(pkg.projectPath, '../node_modules')
                }), nodeExternals({
                    allowlist
                }), nodeExternals({
                    allowlist,
                    modulesDir: path.resolve(pkg.projectPath, '../../node_modules')
                })] : [])
                .node
                    .merge({
                        __dirname: false,
                        __filename: false
                    })
                .end()
                .merge({
                    devtool:  dev ? 'eval-cheap-module-source-map' : 'nosources-source-map'
                });
        } else {
            config
                .target('web')
                .resolve
                    .merge({
                        fallback: {
                            child_process: false,
                            net: false,
                            crypto: false,
                            os: false,
                            path: false,
                            process: false,
                            timers: false
                        }
                    })
                .end()
                .plugin('buffer')
                    .use(webpack.ProvidePlugin, [{
                        Buffer: [ 'buffer', 'Buffer' ],
                        process: 'process/browser'
                    }])
                .end()
                .performance
                    .merge({
                        hints: false
                    })
                .end()
                .module
                    .rule('workerMain')
                        .test(/worker-main\.js$/)
                        .use('worker-loader')
                            .loader('worker-loader')
                            .options({
                                name: 'worker-ext.[fullhash].js'
                            })
                        .end()
                    .end()
                    .rule('img')
                        .merge({
                            test: /\.(jpg|png|gif)$/,
                            type: 'asset/resource',
                            generator: {
                                filename: '[hash][ext]'
                            }
                        })
                    .end()
                    .rule('ignore')
                        .test(/source-map-support/)
                        .use('ignore-loader')
                            .loader('ignore-loader')
                        .end()
                    .end()
                    .rule('svg')
                        .merge({
                            test: /\.(ttf|eot|svg)(\\?v=\\d+\\.\\d+\\.\\d+)?$/,
                            type: 'asset',
                            parser: {
                                dataUrlCondition: {
                                    maxSize: 10000,
                                }
                            },
                            generator: {
                                dataUrl: {
                                    mimetype: 'image/svg+xml'
                                }
                            }
                        })
                    .end()
                    .rule('font')
                        .merge({
                            test: /\.woff(2)?(\\?v=[0-9]\\.[0-9]\\.[0-9])?$/,
                            type: 'asset',
                            parser: {
                                dataUrlCondition: {
                                    maxSize: 10000,
                                }
                            },
                            generator: {
                                dataUrl: {
                                    mimetype: 'image/svg+xml'
                                }
                            }
                        })
                    .end()
                    .rule('wasm')
                        .merge({
                            test: /\.wasm$/,
                            type: 'asset/resource'
                        })
                    .end()
                    .rule('plist')
                        .merge({
                            test: /\.plist$/,
                            type: 'asset/resource'
                        })
                    .end();
        }

    }

    support(context: CliContext, target: string): boolean {
        return true;
    }
}
