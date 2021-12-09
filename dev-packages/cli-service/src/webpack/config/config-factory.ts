
import { BaseConfigFactory } from './base-config-factory';
import { BACKEND_TARGET, FRONTEND_TARGET, ConfigUtil, CliContext } from '@malagu/cli-common';
import { HookExecutor } from '../../hooks';
import { EntryConfigFactory } from './entry-config-factory';
import { OutputConfigFactory } from './output-config-factory';
import { DevServerConfigFactory } from './dev-server-config-factory';
import { CopyWepackPluginConfigFactory, FilterWarningsPluginConfigFactory, FriendlyErrorsWebpackPluginConfigFactory,
    HtmlWebpackTagsPluginConfigFactory, HtmlWebpackPluginConfigFactory, CleanWebpackPluginConfigFactory,
    ProgressPluginConfigFactory, DefinePluginConfigFactory } from './plugin-config-factory';
import { MalaguYamlConfigFactory } from './malagu-yaml-config-factory';
import { ComponentConfigConfigFactory, ComponentConfigFactory } from './component-config-factory';
import * as WebpackChain from 'webpack-chain';

export class ConfigFactory {
    async create(ctx: CliContext): Promise<WebpackChain[]> {
        const { cfg } = ctx;
        const targets = [ BACKEND_TARGET, FRONTEND_TARGET ];

        const configurations = [];

        const configFactories = [
            new BaseConfigFactory(),
            new DefinePluginConfigFactory(),
            new FilterWarningsPluginConfigFactory(),
            new OutputConfigFactory(),
            new DevServerConfigFactory(),
            new FriendlyErrorsWebpackPluginConfigFactory(),
            new CopyWepackPluginConfigFactory(),
            new ComponentConfigFactory(),
            new MalaguYamlConfigFactory(),
            new HtmlWebpackPluginConfigFactory(),
            new HtmlWebpackTagsPluginConfigFactory(),
            new CleanWebpackPluginConfigFactory(),
            new ProgressPluginConfigFactory(),
            new EntryConfigFactory(),
            new ComponentConfigConfigFactory()
        ];

        for (const target of targets) {
            if (!ConfigUtil.support(cfg, target)) {
                continue;
            }

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

        return configurations;
    }
}
