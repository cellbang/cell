
import * as webpack from 'webpack';
import * as path from 'path';
import { Context } from './context';
import { BACKEND_TARGET } from '../../constants';
import mergeWith = require('lodash.mergewith');
import { customizer } from '../../package';

export class BackendConfigFactory {
    create(context: Context): webpack.Configuration {
        const { pkg, port, open, dev } = context;
        const outputPath = path.resolve(pkg.projectPath, context.dest, BACKEND_TARGET);
        let appConfig = { ...pkg.props };
        delete appConfig.backend;
        delete appConfig.frontend;
        appConfig = mergeWith(appConfig, pkg.props.backend, customizer);
        let entry = appConfig.entry;
        if (dev) {
            if (entry && (typeof entry !== 'string' || !entry.includes('dev-'))) {
                entry = '@malagu/core/lib/node/dev-application-entry';
            }
        } else {
            const type = appConfig.deployConfig ? appConfig.deployConfig.type : undefined;
            if (type && typeof entry !== 'string') {
                entry = entry[type];
            }
        }
        entry = pkg.resolveModule(entry.split(path.sep).join('/'));
        return <webpack.Configuration>{
            name: BACKEND_TARGET,
            entry: entry,
            target: 'node',
            devtool: 'inline-source-map',
            output: {
                path: outputPath,
                filename: 'index.js',
                libraryTarget: 'umd'
            },
            devServer: {
                port,
                open,
                stats: 'errors-only'
            },
            plugins: [
                new webpack.DefinePlugin({
                    'process.env': JSON.stringify(appConfig)
                })
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
                    }
                ]
            }
        };
    }

    support(context: Context): boolean {
        return context.pkg.backendModules.size > 0;
    }
}