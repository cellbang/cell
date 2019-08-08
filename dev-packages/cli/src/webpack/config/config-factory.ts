
import * as webpack from 'webpack';
import { BaseConfigFactory } from './base-config-factory';
import { FrontendConfigFactory } from './frontend-config-factory';
import { BackendConfigFactory } from './backend-config-factory';
import { Context } from './context';
import * as merge from 'webpack-merge';

export class ConfigFactory {
    async create(context: Context): Promise<webpack.Configuration[]> {
        const configurations = [];
        const baseConfig = new BaseConfigFactory().create(context);

        const configFactories = [new FrontendConfigFactory(),  new BackendConfigFactory()];
        for (const configFactory of configFactories) {
            if (configFactory.support(context)) {
                const config = merge(baseConfig, configFactory.create(context));
                const webpackHook = context.config.webpack || ((config: webpack.Configuration, context: Context) => config);
                configurations.push(webpackHook(config, context));
            } 
        }

        if (configurations.length === 0) {
            throw new Error('No malagu module found.');
        }
        
        return configurations;
    }
}