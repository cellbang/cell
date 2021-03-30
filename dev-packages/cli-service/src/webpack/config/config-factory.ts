
import { BaseConfigFactory } from './base-config-factory';
import { BACKEND_TARGET, FRONTEND_TARGET, getModules, support, CliContext } from '@malagu/cli-common';
import { ServiceHookExecutor } from '../../hook';
import { EntryConfigFactory } from './entry-config-factory';
import { OutputConfigFactory } from './output-config-factory';
import { DevServerConfigFactory } from './dev-server-config-factory';
import { CopyWepackPluginConfigFactory, FilterWarningsPluginConfigFactory,
    HardSourceWebpackPluginConfigFactory, FriendlyErrorsWebpackPluginConfigFactory, ToES5PluginConfigFactory,
    HtmlWebpackTagsPluginConfigFactory, HtmlWebpackPluginConfigFactory, CleanWebpackPluginConfigFactory,
    ProgressPluginConfigFactory } from './plugin-config-factory';
import { MalaguYamlConfigFactory } from './malagu-yaml-config-factory';
import { ComponentConfigConfigFactory, ComponentConfigFactory } from './component-config-factory';
const chalk = require('chalk');
import * as WebpackChian from 'webpack-chain';

export class ConfigFactory {
    async create(context: CliContext): Promise<WebpackChian[]> {
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
            new ComponentConfigFactory(),
            new ComponentConfigConfigFactory(),
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

            const configuration = new WebpackChian();
            for (const configFactory of configFactories) {
                if (configFactory.support(context, target)) {
                    configFactory.create(configuration, context, target);
                }
            }
            configurations.push(configuration);
        }

        await new ServiceHookExecutor().executeWebpackHooks({
            ...context,
            configurations
        });

        return configurations;
    }
}
