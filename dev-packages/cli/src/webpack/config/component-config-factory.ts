
import { HookContext } from '../../context';
import * as path from 'path';

const nodePathList = (process.env.NODE_PATH || '')
    .split(process.platform === 'win32' ? ';' : ':')
    .filter(p => !!p);

export class ComponentConfigFactory {
    create(config: any, context: HookContext, target: string) {
        const { pkg } = context;
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
                                modules: Array.from((pkg as any)[`${target}Modules`].values())
                            }
                        }
                    },
                ]
            }
        };
    }

    support(context: HookContext, target: string): boolean {
        return true;
    }
}

