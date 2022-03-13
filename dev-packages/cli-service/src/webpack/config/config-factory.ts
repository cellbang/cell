
import { BaseConfigFactory } from './base-config-factory';
import { FRONTEND_TARGET, BACKEND_TARGET } from '@malagu/cli-common/lib/constants';
import { CliContext } from '@malagu/cli-common/lib/context/context-protocol';
import { ConfigUtil } from '@malagu/cli-common/lib/utils/config-util';
import { HookExecutor } from '../../hooks/hook-executor';
import { EntryConfigFactory } from './entry-config-factory';
import { OutputConfigFactory } from './output-config-factory';
import { DevServerConfigFactory } from './dev-server-config-factory';
import { DotenvPluginConfigFactory, CopyWebpackPluginConfigFactory, FilterWarningsPluginConfigFactory, FriendlyErrorsWebpackPluginConfigFactory,
    HtmlWebpackTagsPluginConfigFactory, HtmlWebpackPluginConfigFactory, CleanWebpackPluginConfigFactory, AssetsPluginConfigFactory,
    ProgressPluginConfigFactory, DefinePluginConfigFactory, NormalModuleReplacementPluginConfigFactory, NodePolyfillPluginConfigFactory } from './plugin-config-factory';
import { MalaguYamlConfigFactory } from './malagu-yaml-config-factory';
import { ComponentConfigConfigFactory, ComponentConfigFactory } from './component-config-factory';
import * as WebpackChain from '@gem-mine/webpack-chain';

export class ConfigFactory {
    async create(ctx: CliContext): Promise<WebpackChain[]> {
        const { cfg } = ctx;
        const targets = [ BACKEND_TARGET, FRONTEND_TARGET ];

        const configurations: WebpackChain[] = [];

        const configFactories = [
            new DotenvPluginConfigFactory(),
            new BaseConfigFactory(),
            new DefinePluginConfigFactory(),
            new FilterWarningsPluginConfigFactory(),
            new OutputConfigFactory(),
            new DevServerConfigFactory(),
            new FriendlyErrorsWebpackPluginConfigFactory(),
            new AssetsPluginConfigFactory(),
            new CopyWebpackPluginConfigFactory(),
            new ComponentConfigFactory(),
            new MalaguYamlConfigFactory(),
            new HtmlWebpackPluginConfigFactory(),
            new HtmlWebpackTagsPluginConfigFactory(),
            new CleanWebpackPluginConfigFactory(),
            new ProgressPluginConfigFactory(),
            new EntryConfigFactory(),
            new NormalModuleReplacementPluginConfigFactory(),
            new ComponentConfigConfigFactory(),
            new NodePolyfillPluginConfigFactory()
        ];

        await new HookExecutor().executeBeforeWebpackHooks({
            ...ctx,
            configurations
        });

        for (const target of targets) {
            if (!ConfigUtil.support(cfg, target)) {
                continue;
            }

            const config = ConfigUtil.getConfig(cfg, target);

            config.malagu = config.malagu || {};
            config.malagu.webpack = ConfigUtil.merge(config.malagu.webpack, config.webpack);
            config.webpack = config.malagu.webpack;

            if (typeof config.includeModules === 'boolean' || typeof config.malagu.includeModules === 'boolean') {
                if (typeof config.includeModules !== 'undefined') {
                    config.malagu.includeModules = config.includeModules;
                }
            } else {
                config.malagu.includeModules = ConfigUtil.merge(config.malagu.includeModules, config.includeModules);
            }
            config.includeModules = config.malagu.includeModules;

            const configuration = new WebpackChain();
            for (const configFactory of configFactories) {
                if (configFactory.support(ctx, target)) {
                    configFactory.create(configuration, ctx, target);
                }
            }
            configurations.push(configuration);
        }

        await new HookExecutor().executeWebpackHooks({
            ...ctx,
            configurations
        });

        await new HookExecutor().executeAfterWebpackHooks({
            ...ctx,
            configurations
        });

        return configurations;
    }
}
