
import { getHomePath, FRONTEND_TARGET, CONFIG_FILE, getConfig, CliContext, getWebpackConfig } from '@malagu/cli-common';
import * as path from 'path';
import { ensureDirSync, writeFileSync } from 'fs-extra';
import yaml = require('js-yaml');
import * as WebpackChian from 'webpack-chain';

const nodePathList = (process.env.NODE_PATH || '')
    .split(process.platform === 'win32' ? ';' : ':')
    .filter(p => !!p);

export class ComponentConfigFactory {
    create(config: WebpackChian, context: CliContext, target: string) {
        const { cfg, pkg, dev } = context;
        const pluginConfig = getWebpackConfig(cfg, target).workboxWebpackPlugin;
        const registed = pluginConfig && (!dev || pluginConfig.generateInDevMode);
        const modules = target === FRONTEND_TARGET ? pkg.frontendModules.values() : pkg.backendModules.values();
        const staticModules = target === FRONTEND_TARGET ? pkg.frontendStaticModules.values() : pkg.backendStaticModules.values();
        config
            .resolveLoader
                .modules
                    .merge([
                        path.join(__dirname, '..', 'loader'), // The loaders Malagu provides
                        path.join(__dirname, '..', '..', '..', 'node_modules'),
                        'node_modules',
                        ...nodePathList, // Support for NODE_PATH environment variable
                    ])
                .end()
            .end()
            .module
                .rule('component')
                    .test(/core[\\/]lib[\\/]common[\\/]container[\\/]dynamic-container\.js$/)
                    .use('component-loader')
                        .loader('component-loader')
                        .options({
                            target: target,
                            registed,
                            modules: [...modules],
                            staticModules: [...staticModules]
                        });
    }

    support(context: CliContext, target: string): boolean {
        return true;
    }
}

export class ComponentConfigConfigFactory {
    create(config: WebpackChian, context: CliContext, target: string) {
        const { cfg, pkg } = context;
        const c = getConfig(cfg, target);
        const source = `module.exports.config = ${JSON.stringify(c)};`;

        const homePath = getHomePath(pkg, target);
        ensureDirSync(homePath);
        const configPath = path.join(homePath, CONFIG_FILE);
        writeFileSync(configPath, yaml.dump(c), { encoding: 'utf8' });
        config
            .module
                .rule('config')
                    .test(/core[\\/]lib[\\/]common[\\/]config[\\/]dynamic-config\.js$/)
                    .use('config-loader')
                        .loader('config-loader')
                        .options( {
                            source
                        });
    }

    support(context: CliContext, target: string): boolean {
        return true;
    }
}
