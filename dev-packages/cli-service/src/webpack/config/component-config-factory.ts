
import { FRONTEND_TARGET, CONFIG_FILE, ConfigUtil, CliContext, PathUtil } from '@malagu/cli-common';
import * as path from 'path';
import { ensureDirSync, writeFileSync } from 'fs-extra';
import { dump } from 'js-yaml';
import * as WebpackChain from 'webpack-chain';

const nodePathList = (process.env.NODE_PATH || '')
    .split(process.platform === 'win32' ? ';' : ':')
    .filter(p => !!p);

export class ComponentConfigFactory {
    create(config: WebpackChain, context: CliContext, target: string) {
        const { cfg, pkg, dev, runtime } = context;
        const modules = target === FRONTEND_TARGET ? pkg.frontendModules : pkg.backendModules;
        const staticModules = target === FRONTEND_TARGET ? pkg.frontendStaticModules : pkg.backendStaticModules;
        if (modules.length === 0 && staticModules.length === 0) {
            return;
        }
        const pluginConfig = ConfigUtil.getWebpackConfig(cfg, target).workboxWebpackPlugin;
        const registed = pluginConfig && (!dev || pluginConfig.generateInDevMode);
        config
            .resolveLoader
                .modules
                    .merge([
                        path.join(__dirname, '..', 'loader'), // The loaders Malagu provides
                        path.join(__dirname, '..', '..', '..', 'node_modules'),
                        path.join(__dirname, '..', '..', '..', '..', '..', '..', 'node_modules'),
                        path.join(PathUtil.getRuntimePath(runtime), 'node_modules'),
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
    create(config: WebpackChain, context: CliContext, target: string) {
        const { cfg, runtime } = context;
        const c = ConfigUtil.getConfig(cfg, target);
        const source = `module.exports.config = ${JSON.stringify(c)};`;

        const homePath = PathUtil.getProjectHomePathForTarget(target, runtime);
        ensureDirSync(homePath);
        const configPath = path.join(homePath, CONFIG_FILE);
        writeFileSync(configPath, dump(c), { encoding: 'utf8' });
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
