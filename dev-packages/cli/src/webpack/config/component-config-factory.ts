
import { CliContext } from '../../context';
import * as path from 'path';
import { getWebpackConfig } from '../utils';

const nodePathList = (process.env.NODE_PATH || '')
    .split(process.platform === 'win32' ? ';' : ':')
    .filter(p => !!p);

export class ComponentConfigFactory {
    create(config: any, context: CliContext, target: string) {
        const { cfg, pkg, dev } = context;
        const pluginConfig = getWebpackConfig(cfg, target).workboxWebpackPlugin;
        const registed = pluginConfig && (!dev || pluginConfig.generateInDevMode);
        return {
            resolveLoader: {
                modules: [
                    path.join(__dirname, '..', 'loader'), // The loaders Malagu provides
                    path.join(__dirname, '..', '..', '..', 'node_modules'),
                    'node_modules',
                    ...nodePathList, // Support for NODE_PATH environment variable
                ]
            },
            module: {
                rules: [
                    {
                        test: /core[\\/]lib[\\/]common[\\/]container[\\/]dynamic-container\.js$/,
                        use: {
                            loader: 'component-loader',
                            options: {
                                target: target,
                                registed,
                                modules: [...(pkg as any)[`${target}Modules`].values()]
                            }
                        }
                    },
                ]
            }
        };
    }

    support(context: CliContext, target: string): boolean {
        return true;
    }
}

