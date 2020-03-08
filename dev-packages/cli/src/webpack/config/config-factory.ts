
import * as webpack from 'webpack';
import { BaseConfigFactory } from './base-config-factory';
import { CliContext } from '../../context';
import * as merge from 'webpack-merge';
import { HookExecutor } from '../../hook/hook-executor';
import { EntryConfigFactory } from './entry-config-factory';
import { OutputConfigFactory } from './output-config-factory';
import { DevServerConfigFactory } from './der-server-config-factory';
import { CopyWepackPluginConfigFactory, EnvironmentPluginConfigFactory,
    ForkTsCheckerWebpackPluginConfigFactory, HardSourceWebpackPluginConfigFactory,
    HtmlWebpackTagsPluginConfigFactory, HtmlWebpackPluginConfigFactory } from './plugin-config-factory';
import { FRONTEND_TARGET, BACKEND_TARGET } from '../../constants';
import { MalaguYamlConfigFactory } from './malagu-yaml-config-factory';
import { ComponentConfigFactory } from './component-config-factory';
import { support } from '../utils';
const chalk = require('chalk');

export class ConfigFactory {
    async create(context: CliContext): Promise<webpack.Configuration[]> {
        const { pkg } = context;
        const configurations = [];

        const targets = [ FRONTEND_TARGET, BACKEND_TARGET ];

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
            new HtmlWebpackTagsPluginConfigFactory()
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
            console.log(chalk`malagu {green.bold target} - ${target}`);
            configurations.push(config);
        }

        await new HookExecutor().executeWebpackHooks({
            ...context,
            configurations
        });
        return configurations;
    }
}
