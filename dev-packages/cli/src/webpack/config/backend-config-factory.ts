
import * as webpack from 'webpack';
import * as path from 'path';
import { Context } from './context';
import { BACKEND_TARGET } from '../../constants';
const WebpackSourceMapSupport = require('webpack-source-map-support');

export class BackendConfigFactory {
    create(context: Context): webpack.Configuration {
        const { pkg, port, open, dev } = context;
        const outputPath = path.resolve(pkg.projectPath, context.dest, BACKEND_TARGET);

        const appConfig = pkg.backendConfig;
        let entry = appConfig.entry;
        const type = appConfig.deployConfig ? appConfig.deployConfig.type : undefined;
        if (type && typeof entry !== 'string') {
            entry = entry[type];
        }
        if (dev) {
            if (entry && !entry.includes('dev-')) {
                const devEntry = path.join(path.dirname(entry), `dev-${path.basename(entry)}`);
                try {
                    pkg.resolveModule(devEntry.split(path.sep).join('/'));
                    entry = devEntry;
                } catch (error) {
                    // noop
                }
            }
        }
        entry = pkg.resolveModule(entry.split(path.sep).join('/'));
        return <webpack.Configuration>{
            name: BACKEND_TARGET,
            entry: entry,
            target: 'node',
            devtool: 'source-map',
            output: {
                path: outputPath,
                filename: 'index.js',
                libraryTarget: 'umd',
                devtoolModuleFilenameTemplate: '[absolute-resource-path]'
            },
            devServer: {
                port,
                open,
                stats: 'errors-only'
            },
            plugins: [
                new webpack.DefinePlugin({
                    'process.env': JSON.stringify(appConfig)
                }),
                new WebpackSourceMapSupport()
            ],
            module: {
                rules: [
                    {
                        test: /malagu([\\/]packages)?[\\/]core[\\/]lib[\\/]common[\\/]dynamic-container\.js$/,
                        use: {
                            loader: 'component-loader',
                            options: {
                                target: 'backend',
                                modules: Array.from(pkg.backendModules.values())
                            }
                        }
                    },
                ]
            }
        };
    }

    support(context: Context): boolean {
        return context.pkg.backendModules.size > 0;
    }
}
