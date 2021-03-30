
import { BACKEND_TARGET, CliContext, getWebpackConfig } from '@malagu/cli-common';
const TerserPlugin = require('terser-webpack-plugin');
const nodeExternals = require('webpack-node-externals');
import * as path from 'path';
import * as WebpackChian from 'webpack-chain';

export class BaseConfigFactory {

    create(config: WebpackChian, context: CliContext, target: string) {
        const { dev, pkg, cfg } = context;
        const sourceMapLoader = getWebpackConfig(cfg, target).sourceMapLoader || {};
        let sourceMapLoaderExclude = sourceMapLoader.exclude || {};
        sourceMapLoaderExclude = Object.keys(sourceMapLoaderExclude).map(key => sourceMapLoaderExclude[key]);
        sourceMapLoaderExclude = new RegExp(['jsonc-parser|class-transformer|smart-buffer|socks|agent-base', ...sourceMapLoaderExclude].join('|'));
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
            .devtool(dev ? 'source-map' : false)
            .stats('minimal')
            .resolve
                .extensions
                    .add('.tsx').add('.ts').add('.js').add('.wasm').add('.mjs').add('.json')
                .end()
            .end()
            .module
                .rule('js')
                    .test(/\.js$/)
                    .use('source-map-loader')
                        .loader('source-map-loader')
                    .end()
                    .enforce('pre')
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
            const whitelist = pkg.componentPackages.map(cp => new RegExp(cp.name));
            config
                .target('node')
                .externals(dev ? [nodeExternals({
                    whitelist,
                    modulesDir: path.resolve(pkg.projectPath, '../node_modules')
                }), nodeExternals({
                    whitelist
                }), nodeExternals({
                    whitelist,
                    modulesDir: path.resolve(pkg.projectPath, '../../node_modules')
                })] : [])
                .node
                    .merge({
                        __dirname: false,
                        __filename: false
                    })
                .end()
                .devtool('source-map');
        } else {
            config
                .target('web')
                .node
                    .merge({
                        fs: 'empty',
                        child_process: 'empty',
                        net: 'empty',
                        crypto: 'empty'
                    })
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
                                name: 'worker-ext.[hash].js'
                            })
                        .end()
                    .end()
                    .rule('img')
                        .test(/\.(jpg|png|gif)$/)
                        .use('file-loader')
                            .loader('file-loader')
                            .options({
                                name: '[hash].[ext]',
                            })
                        .end()
                    .end()
                    .rule('ignore')
                        .test(/source-map-support/)
                        .use('ignore-loader')
                            .loader('ignore-loader')
                        .end()
                    .end()
                    .rule('svg')
                        .test(/\.(ttf|eot|svg)(\\?v=\\d+\\.\\d+\\.\\d+)?$/)
                        .use('url-loader')
                            .loader('url-loader')
                            .options({
                                limit: 10000,
                                mimetype: 'image/svg+xml'
                            })
                        .end()
                    .end()
                    .rule('font')
                        .test(/\.woff(2)?(\\?v=[0-9]\.[0-9]\.[0-9])?$/)
                        .use('url-loader')
                            .loader('url-loader')
                            .options({
                                limit: 10000,
                                mimetype: 'application/font-woff'
                            })
                        .end()
                    .end()
                    .rule('wasm')
                        .test(/\.wasm$/)
                        .type('javascript/auto')
                        .use('file-loader')
                            .loader('file-loader')
                        .end()
                    .end()
                    .rule('plist')
                        .test(/\.plist$/)
                        .use('file-loader')
                            .loader('file-loader')
                        .end()
                    .end();
        }

    }

    support(context: CliContext, target: string): boolean {
        return true;
    }
}
