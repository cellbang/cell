
import * as webpack from 'webpack';
import { Context } from './context';
import * as path from 'path';

const nodePathList = (process.env.NODE_PATH || '')
    .split(process.platform === 'win32' ? ';' : ':')
    .filter(p => !!p);

export class BaseConfigFactory {
    create(context: Context): webpack.Configuration {
        const { dev } = context;
        const webpackMode = dev ? 'development' : 'production'
        return {
            entry: context.entry ? path.resolve(process.cwd(), context.entry) : path.resolve(process.cwd(), 'lib', 'app.js') ,
            mode: webpackMode,
            devtool: dev ? 'inline-source-map' : undefined,
            resolveLoader: {
                modules: [
                  path.join(__dirname, '..', 'loader'), // The loaders Malagu provides
                  'node_modules',
                  ...nodePathList, // Support for NODE_PATH environment variable
                ]
            },
            module: {
                rules: [
                    {
                        test: /\.js$/,
                        enforce: 'pre',
                        loader: 'source-map-loader',
                        exclude: /jsonc-parser|node_modules/
                    }
                ]
            }
        };
    }
}