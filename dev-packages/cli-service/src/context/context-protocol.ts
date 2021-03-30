import * as https from 'https';
import * as http from 'http';
import { BACKEND_TARGET, CliContext, FRONTEND_TARGET } from '@malagu/cli-common';
import * as webpack from 'webpack';
import * as WebpackChian from 'webpack-chain';

export interface ConfigurationContext extends CliContext {
    configurations: WebpackChian[];
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

    export function getConfiguration(target: string, configurations: WebpackChian[]): undefined | WebpackChian {
        for (const c of configurations) {
            if (c.get('name') === target) {
                return c;
            }
        }
    }

    export function getFrontendConfiguration(configurations: WebpackChian[]): undefined | WebpackChian {
        return getConfiguration(FRONTEND_TARGET, configurations);
    }

    export function getBackendConfiguration(configurations: WebpackChian[]): undefined | WebpackChian {
        return getConfiguration(BACKEND_TARGET, configurations);
    }

    export function hasBackendConfiguration(configurations: WebpackChian[]): boolean {
        return !!getConfiguration(BACKEND_TARGET, configurations);
    }

    export function hasFrontendConfiguration(configurations: WebpackChian[]): boolean {
        return !!getConfiguration(FRONTEND_TARGET, configurations);
    }

    export function isFrontendConfiguration(configuration: WebpackChian): boolean {
        return configuration.get('name') === FRONTEND_TARGET;
    }

    export function isBackendConfiguration(configuration: WebpackChian): boolean {
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
