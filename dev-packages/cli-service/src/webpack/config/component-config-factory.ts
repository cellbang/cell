
import { FRONTEND_TARGET } from '@celljs/cli-common/lib/constants';
import { CliContext } from '@celljs/cli-common/lib/context/context-protocol';
import { ConfigUtil } from '@celljs/cli-common/lib/utils/config-util';
import { PathUtil } from '@celljs/cli-common/lib/utils/path-util';
import * as path from 'path';
import * as WebpackChain from '@gem-mine/webpack-chain';

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
                        path.join(__dirname, '..', 'loader'), // The loaders Cell provides
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
        const { cfg } = context;
        const c = ConfigUtil.getConfig(cfg, target);
        const source = `module.exports.config = ${JSON.stringify(c)};`;

        config
            .module
                .rule('config')
                    .test(/core[\\/]lib[\\/]common[\\/]config[\\/]dynamic-config\.js$/)
                    .use('config-loader')
                        .loader('config-loader')
                        .options({
                            source
                        });
    }

    support(context: CliContext, target: string): boolean {
        return true;
    }
}
