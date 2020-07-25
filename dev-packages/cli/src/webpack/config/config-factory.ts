
import * as webpack from 'webpack';
import { BaseConfigFactory } from './base-config-factory';
import { HookContext } from '../../context';
import * as merge from 'webpack-merge';
import { HookExecutor } from '../../hook/hook-executor';
import { EntryConfigFactory } from './entry-config-factory';
import { OutputConfigFactory } from './output-config-factory';
import { DevServerConfigFactory } from './dev-server-config-factory';
import { CopyWepackPluginConfigFactory, EnvironmentPluginConfigFactory, WorkboxWebpackPluginConfigFactory, FilterWarningsPluginConfigFactory,
    ForkTsCheckerWebpackPluginConfigFactory, HardSourceWebpackPluginConfigFactory, FriendlyErrorsWebpackPluginConfigFactory,
    HtmlWebpackTagsPluginConfigFactory, HtmlWebpackPluginConfigFactory, CleanWebpackPluginConfigFactory, ProgressPluginConfigFactory } from './plugin-config-factory';
import { FRONTEND_TARGET, BACKEND_TARGET } from '../../constants';
import { MalaguYamlConfigFactory } from './malagu-yaml-config-factory';
import { ComponentConfigFactory } from './component-config-factory';
import { support } from '../utils';
const chalk = require('chalk');

export class ConfigFactory {
    async create(context: HookContext): Promise<webpack.Configuration[]> {
        const { pkg } = context;
        const configurations = [];

        const targets = [ BACKEND_TARGET, FRONTEND_TARGET ];

        const configFactories = [
            new BaseConfigFactory(),
            new FilterWarningsPluginConfigFactory(),
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
            new WorkboxWebpackPluginConfigFactory(),
            new CleanWebpackPluginConfigFactory(),
            new FriendlyErrorsWebpackPluginConfigFactory(),
            new ProgressPluginConfigFactory()
        ];

        for (const target of targets) {
            if (!support(pkg, target)) {
                continue;
            }
            console.log(chalk`\nmalagu {yellow.bold target} - {bold ${target}}`);
            let config = {};
            for (const configFactory of configFactories) {
                if (configFactory.support(context, target)) {
                    console.log(chalk`malagu {blue.bold webpack} - ${configFactory.constructor.name}`);
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
