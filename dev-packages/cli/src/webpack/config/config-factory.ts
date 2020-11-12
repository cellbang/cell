
import * as webpack from 'webpack';
import { BaseConfigFactory } from './base-config-factory';
import { CliContext } from '../../context';
import * as merge from 'webpack-merge';
import { HookExecutor } from '../../hook/hook-executor';
import { EntryConfigFactory } from './entry-config-factory';
import { OutputConfigFactory } from './output-config-factory';
import { DevServerConfigFactory } from './dev-server-config-factory';
import { CopyWepackPluginConfigFactory, EnvironmentPluginConfigFactory, FilterWarningsPluginConfigFactory,
    HardSourceWebpackPluginConfigFactory, FriendlyErrorsWebpackPluginConfigFactory, ToES5PluginConfigFactory,
    HtmlWebpackTagsPluginConfigFactory, HtmlWebpackPluginConfigFactory, CleanWebpackPluginConfigFactory, ProgressPluginConfigFactory } from './plugin-config-factory';
import { FRONTEND_TARGET, BACKEND_TARGET } from '../../constants';
import { MalaguYamlConfigFactory } from './malagu-yaml-config-factory';
import { ComponentConfigFactory } from './component-config-factory';
import { getModules, support } from '../utils';
const chalk = require('chalk');

export class ConfigFactory {
    async create(context: CliContext): Promise<webpack.Configuration[]> {
        const { cfg, pkg } = context;

        for (const m of pkg.rootComponentPackage.malaguComponent!.mode!) {
            console.log(chalk`malagu {bold.blue mode} - {bold ${m}}`);
        }

        for (const component of pkg.componentPackages) {
            console.log(chalk`malagu {green.bold component} - ${ component.name }@${ component.version }`);
        }

        const configurations = [];

        const targets = [ BACKEND_TARGET, FRONTEND_TARGET ];

        const configFactories = [
            new BaseConfigFactory(),
            new ToES5PluginConfigFactory(),
            new FilterWarningsPluginConfigFactory(),
            new EntryConfigFactory(),
            new OutputConfigFactory(),
            new DevServerConfigFactory(),
            new FriendlyErrorsWebpackPluginConfigFactory(),
            new CopyWepackPluginConfigFactory(),
            new HardSourceWebpackPluginConfigFactory(),
            new EnvironmentPluginConfigFactory(),
            new ComponentConfigFactory(),
            new MalaguYamlConfigFactory(),
            new HtmlWebpackPluginConfigFactory(),
            new HtmlWebpackTagsPluginConfigFactory(),
            new CleanWebpackPluginConfigFactory(),
            new ProgressPluginConfigFactory()
        ];

        for (const target of targets) {
            if (!support(cfg, target)) {
                continue;
            }

            console.log(chalk`\nmalagu {yellow.bold target} - {bold ${target}}`);
            for (const module of getModules(pkg, target).values()) {
                console.log(chalk`malagu {cyan.bold module} - ${ module }`);
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
