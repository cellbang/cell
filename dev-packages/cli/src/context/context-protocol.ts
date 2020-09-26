import { ApplicationPackage } from '../package';
import webpack = require('webpack');
import * as https from 'https';
import * as http from 'http';
import { CommanderStatic } from 'commander';
import { checkPkgVersionConsistency } from '../util';
import { FRONTEND_TARGET, BACKEND_TARGET } from '../constants';
import { HookExecutor } from '../hook';
import { ExpressionHandler } from '../el';
import { ApplicationConfig } from '../package/application-config';

export interface CliContext {
    program: CommanderStatic;
    pkg: ApplicationPackage;
    cfg: ApplicationConfig;
    [key: string]: any;
}

export namespace CliContext {
    export async function create(program: CommanderStatic, options: { [key: string]: any } = {}, projectPath: string = process.cwd(), skipComponent = false): Promise<CliContext> {
        // at this point, we will check the core package version in the *.lock file firstly
        if (!skipComponent) {
            checkPkgVersionConsistency('@malagu/core', projectPath);
        }

        const mode = options.mode || [];
        const targets = options.targets || [];
        const pkg = ApplicationPackage.create({ projectPath, mode });
        const cfg = new ApplicationConfig({ targets, program }, pkg);

        if (!skipComponent) {
            for (const target of [ FRONTEND_TARGET, BACKEND_TARGET ]) {
                const config = cfg.getConfig(target);
                const hookExecutor = new HookExecutor();
                await hookExecutor.executeConfigHooks({
                    pkg,
                    cfg,
                    program,
                    config: config
                });

                config.env = { ...process.env, _ignoreEl: true };

                config.pkg = { ...pkg.pkg, _ignoreEl: true};
                config.cliContext = { ...options, ...program, _ignoreEl: true};
                new ExpressionHandler(config).handle();
                delete config.env;
                delete config.pkg;
                delete config.cliContext;
            }

        }

        return <CliContext> {
            ...options,
            pkg,
            cfg,
            dest: 'dist',
            program
        };
    }
}
export interface ConfigurationContext extends CliContext {
    configurations: webpack.Configuration[];
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

    export function getConfiguration(target: string, configurations: webpack.Configuration[]): undefined | webpack.Configuration {
        for (const c of configurations) {
            if (c.name === target) {
                return c;
            }
        }
    }
}

let _current: CliContext;

export namespace ContextUtils {

    export function getCurrent() {
        return _current;
    }

    export function setCurrent(current: CliContext) {
        _current = current;
    }

    export function createCliContext(program: CommanderStatic, options: { [key: string]: any } = {}, projectPath: string = process.cwd()): Promise<CliContext> {
        return CliContext.create(program, options, projectPath);
    }

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

    export function createInitContext(cliContext: CliContext): Promise<InitContext> {
        return Promise.resolve(cliContext);
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

    export async function createConfigContext(cliContext: CliContext, config: { [key: string]: any }): Promise<ConfigContext> {
        return { ...cliContext, config };
    }

}

export interface BuildContext extends ConfigurationContext {

}

export interface InitContext extends CliContext {

}

export interface DeployContext extends ConfigurationContext {

}

export interface WebpackContext extends ConfigurationContext {

}

export interface ConfigContext extends CliContext {
    config: { [key: string]: any };

}

export interface ServeContext extends ConfigurationContext {
    server: http.Server | https.Server;
    app: any;
    compiler: webpack.Compiler;
    entryContextProvider: () => Promise<any>;
}
