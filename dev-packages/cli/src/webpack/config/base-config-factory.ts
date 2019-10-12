
import * as webpack from 'webpack';
import { CliContext } from '../../context';
import * as path from 'path';
const TerserPlugin = require('terser-webpack-plugin');

const nodePathList = (process.env.NODE_PATH || '')
    .split(process.platform === 'win32' ? ';' : ':')
    .filter(p => !!p);

export class BaseConfigFactory {
    create(context: CliContext): webpack.Configuration {
        const { dev, pkg } = context;
        const webpackMode = dev ? 'development' : 'production';
        return {
            entry: context.entry ? path.resolve(pkg.packagePath, context.entry) : path.resolve(pkg.packagePath, 'lib', 'app.js'),
            mode: webpackMode,
            optimization: {
                minimize: !dev,
                minimizer: [
                    new TerserPlugin({
                        terserOptions: {
                            keep_classnames: true,
                            keep_fnames: true
                        },
                        extractComments: false
                    })
                ]
            },
            devtool: dev ? 'source-map' : undefined,
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
                stats: 'errors-only'
            },
            resolve: {
                extensions: [ '.tsx', '.ts', '.js' ]
            },
            module: {
                rules: [
                    {
                        test: /\.js$/,
                        enforce: 'pre',
                        loader: 'source-map-loader',
                        exclude: /jsonc-parser/
                    },
                    {
                        test: /\.tsx?$/,
                        use: 'ts-loader',
                        exclude: /node_modules/
                    }
                ]
            },
            plugins: [
            ]
        };
    }
}
