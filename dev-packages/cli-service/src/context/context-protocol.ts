import * as https from 'https';
import * as http from 'http';
import { BACKEND_TARGET, CliContext, FRONTEND_TARGET } from '@malagu/cli-common';
import * as webpack from 'webpack';
import * as WebpackChain from 'webpack-chain';

export interface ConfigurationContext extends CliContext {
    configurations: WebpackChain[];
}

export namespace ConfigurationContext {
    export async function create(cliContext: CliContext, options: { [key: string]: any } = {} ): Promise<ConfigurationContext> {
        const { ConfigFactory } = require('../webpack');
        const configFactory = new ConfigFactory();
        const configurations = await configFactory.create({ ...cliContext, ...options });
        return {
            ...options,
            ...cliContext,
            configurations: configurations
        };
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

    export async function createConfigurationContext(cliContext: CliContext, options?: { [key: string]: any }): Promise<BuildContext> {
        return ConfigurationContext.create(cliContext, options);
    }

    export function createBuildContext(cliContext: CliContext, options?: { [key: string]: any }): Promise<BuildContext> {
        return createConfigurationContext(cliContext, options);
    }

    export function createDeployContext(cliContext: CliContext, options?: { [key: string]: any }): Promise<DeployContext> {
        return createConfigurationContext(cliContext, options);
    }

    export function createWebpackContext(cliContext: CliContext, options?: { [key: string]: any }): Promise<WebpackContext> {
        return createConfigurationContext(cliContext, options);
    }

    export async function createServeContext(context: ConfigurationContext, server: http.Server | https.Server, app: any, compiler: webpack.Compiler,
        entryContextProvider: () => Promise<any>): Promise<ServeContext> {
        return {
            ...context,
            server,
            app,
            compiler,
            entryContextProvider
        };
    }

}

export interface BuildContext extends ConfigurationContext {

}

export interface DeployContext extends ConfigurationContext {

}

export interface WebpackContext extends ConfigurationContext {

}

export interface ServeContext extends ConfigurationContext {
    server: http.Server | https.Server;
    app: any;
    compiler: webpack.Compiler;
    entryContextProvider: () => Promise<any>;
}
