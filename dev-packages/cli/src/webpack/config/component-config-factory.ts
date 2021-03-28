
import { CliContext } from '../../context';
import * as path from 'path';
import { getConfig, getHomePath, getWebpackConfig } from '../utils';
import { CONFIG_FILE, FRONTEND_TARGET } from '../../constants';
import { ensureDirSync, writeFileSync } from 'fs-extra';
import yaml = require('js-yaml');

const nodePathList = (process.env.NODE_PATH || '')
    .split(process.platform === 'win32' ? ';' : ':')
    .filter(p => !!p);

export class ComponentConfigFactory {
    create(config: any, context: CliContext, target: string) {
        const { cfg, pkg, dev } = context;
        const pluginConfig = getWebpackConfig(cfg, target).workboxWebpackPlugin;
        const registed = pluginConfig && (!dev || pluginConfig.generateInDevMode);
        const modules = target === FRONTEND_TARGET ? pkg.frontendModules.values() : pkg.backendModules.values();
        const staticModules = target === FRONTEND_TARGET ? pkg.frontendStaticModules.values() : pkg.backendStaticModules.values();
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
                                modules: [...modules],
                                staticModules: [...staticModules]
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

export class ComponentConfigConfigFactory {
    create(config: any, context: CliContext, target: string) {
        const { cfg, pkg } = context;
        const c = getConfig(cfg, target);
        const source = `module.exports.config = ${JSON.stringify(c)};`;

        const homePath = getHomePath(pkg, target);
        ensureDirSync(homePath);
        const configPath = path.join(homePath, CONFIG_FILE);
        writeFileSync(configPath, yaml.dump(c), { encoding: 'utf8' });
        return {
            module: {
                rules: [
                    {
                        test: /core[\\/]lib[\\/]common[\\/]config[\\/]dynamic-config\.js$/,
                        use: {
                            loader: 'config-loader',
                            options: {
                                source
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
