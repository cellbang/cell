import * as https from 'https';
import * as http from 'http';
import { BACKEND_TARGET, FRONTEND_TARGET } from '@malagu/cli-common/lib/constants';
import { CliContext } from '@malagu/cli-common/lib/context/context-protocol';
import * as webpack from 'webpack';
import * as WebpackChain from '@gem-mine/webpack-chain';

export interface ConfigurationContext extends CliContext {
    configurations: WebpackChain[];
}

export namespace ConfigurationContext {
    export async function create(cliContext: CliContext): Promise<ConfigurationContext> {
        const { ConfigFactory } = require('../webpack');
        const configFactory = new ConfigFactory();
        cliContext.configurations = await configFactory.create(cliContext);
        return <ConfigurationContext>cliContext;
    }

    export function getConfiguration(target: string, configurations: WebpackChain[]): undefined | WebpackChain {
        for (const c of configurations) {
            if (c.get('name') === target) {
                return c;
            }
        }
    }

    export function getFrontendConfiguration(configurations: WebpackChain[]): undefined | WebpackChain {
        return getConfiguration(FRONTEND_TARGET, configurations);
    }

    export function getBackendConfiguration(configurations: WebpackChain[]): undefined | WebpackChain {
        return getConfiguration(BACKEND_TARGET, configurations);
    }

    export function hasBackendConfiguration(configurations: WebpackChain[]): boolean {
        return !!getConfiguration(BACKEND_TARGET, configurations);
    }

    export function hasFrontendConfiguration(configurations: WebpackChain[]): boolean {
        return !!getConfiguration(FRONTEND_TARGET, configurations);
    }

    export function isFrontendConfiguration(configuration: WebpackChain): boolean {
        return configuration.get('name') === FRONTEND_TARGET;
    }

    export function isBackendConfiguration(configuration: WebpackChain): boolean {
        return configuration.get('name') === BACKEND_TARGET;
    }
}

export namespace ServiceContextUtils {

    export async function createConfigurationContext(cliContext: CliContext): Promise<ConfigurationContext> {
        return ConfigurationContext.create(cliContext);
    }

    export function createWebpackContext(cliContext: CliContext): Promise<WebpackContext> {
        return createConfigurationContext(cliContext);
    }

}

export interface WebpackContext extends ConfigurationContext {

}

export interface BeforeWebpackContext extends ConfigurationContext {

}

export interface BeforeServeContext extends ConfigurationContext {

}

export interface ServeContext extends ConfigurationContext {
    server: http.Server | https.Server;
    app: any;
    compiler: webpack.Compiler;
    entryContextProvider: () => Promise<any>;
}
