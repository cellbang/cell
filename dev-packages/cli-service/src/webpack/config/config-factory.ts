
import { BaseConfigFactory } from './base-config-factory';
import { FRONTEND_TARGET, BACKEND_TARGET } from '@celljs/cli-common/lib/constants';
import { CliContext } from '@celljs/cli-common/lib/context/context-protocol';
import { ConfigUtil } from '@celljs/cli-common/lib/utils/config-util';
import { HookExecutor } from '../../hooks/hook-executor';
import { EntryConfigFactory } from './entry-config-factory';
import { OutputConfigFactory } from './output-config-factory';
import { DevServerConfigFactory } from './dev-server-config-factory';
import { CopyWebpackPluginConfigFactory, FilterWarningsPluginConfigFactory, FriendlyErrorsWebpackPluginConfigFactory,
    HtmlWebpackTagsPluginConfigFactory, HtmlWebpackPluginConfigFactory, CleanWebpackPluginConfigFactory, AssetsPluginConfigFactory,
    ProgressPluginConfigFactory, DefinePluginConfigFactory, NormalModuleReplacementPluginConfigFactory, NodePolyfillPluginConfigFactory } from './plugin-config-factory';
import { CellYamlConfigFactory } from './cell-yaml-config-factory';
import { ComponentConfigConfigFactory, ComponentConfigFactory } from './component-config-factory';
import * as WebpackChain from '@gem-mine/webpack-chain';

export class ConfigFactory {
    async create(ctx: CliContext): Promise<WebpackChain[]> {
        const { cfg } = ctx;
        const targets = [ BACKEND_TARGET, FRONTEND_TARGET ];

        const configurations: WebpackChain[] = [];

        const configFactories = [
            new BaseConfigFactory(),
            new DefinePluginConfigFactory(),
            new FilterWarningsPluginConfigFactory(),
            new OutputConfigFactory(),
            new DevServerConfigFactory(),
            new FriendlyErrorsWebpackPluginConfigFactory(),
            new AssetsPluginConfigFactory(),
            new CopyWebpackPluginConfigFactory(),
            new ComponentConfigFactory(),
            new CellYamlConfigFactory(),
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

            config.cell = config.cell || {};
            config.cell.webpack = ConfigUtil.merge(config.cell.webpack, config.webpack);
            config.webpack = config.cell.webpack;

            if (typeof config.includeModules === 'boolean' || typeof config.cell.includeModules === 'boolean') {
                if (typeof config.includeModules !== 'undefined') {
                    config.cell.includeModules = config.includeModules;
                }
            } else {
                config.cell.includeModules = ConfigUtil.merge(config.cell.includeModules, config.includeModules);
            }
            config.includeModules = config.cell.includeModules;

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
