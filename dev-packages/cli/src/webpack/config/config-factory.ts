
import * as webpack from 'webpack';
import { BaseConfigFactory } from './base-config-factory';
import { HookContext } from '../../context';
import * as merge from 'webpack-merge';
import { HookExecutor } from '../../hook/hook-executor';
import { EntryConfigFactory } from './entry-config-factory';
import { OutputConfigFactory } from './output-config-factory';
import { DevServerConfigFactory } from './dev-server-config-factory';
import { CopyWepackPluginConfigFactory, EnvironmentPluginConfigFactory,
    ForkTsCheckerWebpackPluginConfigFactory, HardSourceWebpackPluginConfigFactory,
    HtmlWebpackTagsPluginConfigFactory, HtmlWebpackPluginConfigFactory, CleanWebpackPluginConfigFactory } from './plugin-config-factory';
import { FRONTEND_TARGET, BACKEND_TARGET } from '../../constants';
import { MalaguYamlConfigFactory } from './malagu-yaml-config-factory';
import { ComponentConfigFactory } from './component-config-factory';
import { support } from '../utils';

export class ConfigFactory {
    async create(context: HookContext): Promise<webpack.Configuration[]> {
        const { pkg } = context;
        const configurations = [];

        const targets = [ BACKEND_TARGET, FRONTEND_TARGET ];

        const configFactories = [
            new BaseConfigFactory(),
            new EntryConfigFactory(),
            new OutputConfigFactory(),
            new DevServerConfigFactory(),
            new CopyWepackPluginConfigFactory(),
            new ForkTsCheckerWebpackPluginConfigFactory(),
            new HardSourceWebpackPluginConfigFactory(),
            new EnvironmentPluginConfigFactory(),
            new ComponentConfigFactory(),
            new MalaguYamlConfigFactory(),
            new HtmlWebpackPluginConfigFactory(),
            new HtmlWebpackTagsPluginConfigFactory(),
            new CleanWebpackPluginConfigFactory()
        ];

        for (const target of targets) {
            if (!support(pkg, target)) {
                continue;
            }
            let config = {};
            for (const configFactory of configFactories) {
                if (configFactory.support(context, target)) {
                    config = merge(config, configFactory.create(config, context, target) as any);
                }
            }
            configurations.push(config);
        }

        await new HookExecutor().executeWebpackHooks({
            ...context,
            configurations
        });
        return configurations;
    }
}
