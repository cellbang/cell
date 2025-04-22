
import { BACKEND_TARGET } from '@celljs/cli-common/lib/constants';
import { CliContext } from '@celljs/cli-common/lib/context/context-protocol';
import { ConfigUtil } from '@celljs/cli-common/lib/utils/config-util';
import { PathUtil } from '@celljs/cli-common/lib/utils/path-util';
const TerserPlugin = require('terser-webpack-plugin');
const nodeExternals = require('webpack-node-externals');
import * as path from 'path';
import * as WebpackChain from '@gem-mine/webpack-chain';

export class BaseConfigFactory {

    create(config: WebpackChain, context: CliContext, target: string) {
        const { dev, pkg, cfg, runtime } = context;
        const stage = ConfigUtil.getBackendConfig(cfg).stage;
        const includeModules = ConfigUtil.getBackendCellConfig(cfg).includeModules;
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
                devtool:  dev ? 'source-map' : false
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
            const mode = pkg.rootComponentPackage.cellComponent?.mode ?? [];
            const allowlist = pkg.componentPackages.map(cp => new RegExp(cp.name));
            const externals = [nodeExternals({
                allowlist,
                modulesDir: path.resolve(pkg.projectPath, './node_modules')
            }), nodeExternals({
                allowlist,
                modulesDir: path.resolve(pkg.projectPath, '../node_modules')
            }), nodeExternals({
                allowlist,
                modulesDir: path.resolve(pkg.projectPath, '../../node_modules')
            }), nodeExternals({
                allowlist,
                modulesDir: path.resolve(process.cwd(), './node_modules')
            }), nodeExternals({
                allowlist,
                modulesDir: path.resolve(process.cwd(), '../node_modules')
            }), nodeExternals({
                allowlist,
                modulesDir: path.resolve(process.cwd(), '../../node_modules')
            })];

            config
                .target('node')
                .resolve
                    .modules
                        .merge([ 'node_modules', path.join(PathUtil.getRuntimePath(runtime), 'node_modules') ])
                    .end()
                .end()
                .optimization
                    .minimize(!dev && stage === 'prod')
                .end()
                .externals(dev ? (mode.includes('test-container') ? ((ctx, cb) => {
                    if (ctx.request?.includes('dynamic-container') || ctx.request?.includes('application-entry')) {
                        cb();
                    } else {
                        cb(undefined, 'commonjs ' + ctx.request);
                    }
                }) : externals) : includeModules?.forceIncludeAll ? externals : [])
                .node
                    .merge({
                        __dirname: false,
                        __filename: false
                    })
                .end()
                .merge({
                    devtool:  dev ? 'source-map' : false,
                    externalsPresets: { node: true }
                });
        } else {
            config
                .target('web')
                .optimization
                    .minimize(!dev)
                .end()
                .performance
                    .merge({
                        hints: false
                    })
                .end()
                .module
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
