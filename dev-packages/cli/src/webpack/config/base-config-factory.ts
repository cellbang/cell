
import * as webpack from 'webpack';
import { CliContext } from '../../context';
import * as path from 'path';
import * as merge from 'webpack-merge';
const TerserPlugin = require('terser-webpack-plugin');
const ForkTsCheckerNotifierWebpackPlugin = require('fork-ts-checker-notifier-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const nodePathList = (process.env.NODE_PATH || '')
    .split(process.platform === 'win32' ? ';' : ':')
    .filter(p => !!p);

export class BaseConfigFactory {
    private _config: any;

    private _baseWebpackConfig = {
        forkTSCheckerWebpackPlugin: {
            tslint: true,
        }
    };

    getConfig(context: CliContext) {
        if (this._config) {
            return this._config;
        }
        const { pkg } = context;
        this._config = { ...this._baseWebpackConfig, ...pkg.rootConfig.malagu.webpack };
        return this._config;
    }
    create(context: CliContext): webpack.Configuration {
        const { dev, pkg } = context;
        const webpackMode = dev ? 'development' : 'production';
        const config = this.getConfig(context);
        return merge(<webpack.Configuration>{
            entry: context.entry ? path.resolve(pkg.packagePath, context.entry) : path.resolve(pkg.packagePath, 'lib', 'app.js'),
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
            devtool: dev ? 'cheap-eval-source-map' : undefined,
            stats: 'errors-only',
            resolveLoader: {
                modules: [
                    path.join(__dirname, '..', 'loader'), // The loaders Malagu provides
                    path.join(__dirname, '..', '..', '..', 'node_modules'),
                    'node_modules',
                    ...nodePathList, // Support for NODE_PATH environment variable
                ]
            },
            devServer: {
              stats: 'errors-only',
            },
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
            },
            plugins: [
                new ForkTsCheckerWebpackPlugin(config.forkTSCheckerWebpackPlugin),
                new ForkTsCheckerNotifierWebpackPlugin({ title: 'TypeScript', excludeWarnings: false }),
            ]
        }, config);
    }
}
