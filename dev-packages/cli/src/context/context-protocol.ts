import { ApplicationPackage } from '../package';
import webpack = require('webpack');
import * as https from 'https';
import * as http from 'http';
import { RawComponentPackage } from '../package';
import { join } from 'path';
import { ConfigFactory } from '../webpack';
import { CommanderStatic } from 'commander';
import { checkPkgVersionConsistency } from '../util';
import { FRONTEND_TARGET, BACKEND_TARGET } from '../constants';
import { HookExecutor } from '../hook';
import { ExpressionHandler } from '../el';

export interface HookContext {
    program: CommanderStatic;
    pkg: ApplicationPackage;
    [key: string]: any;
}

export namespace HookContext {
    export async function create(program: CommanderStatic, options: { [key: string]: any } = {}, projectPath: string = process.cwd(), skipComponent = false): Promise<HookContext> {
        // at this point, we will check the core package version in the *.lock file firstly
        if (!skipComponent) {
            checkPkgVersionConsistency('@malagu/core', projectPath);
        }

        const mode = options.mode || [];
        let pkg = new ApplicationPackage({ projectPath, mode, program });
        if (!RawComponentPackage.is(pkg.pkg)) {
            const { malagu } = pkg.pkg;
            if (malagu && malagu.rootComponent) {
                pkg = new ApplicationPackage({ projectPath: join(projectPath, malagu.rootComponent), mode, program});
            }
        }

        if (!skipComponent) {
            for (const target of [ FRONTEND_TARGET, BACKEND_TARGET ]) {
                const config = pkg.getConfig(target);
                const hookExecutor = new HookExecutor();
                await hookExecutor.executeConfigHooks({
                    pkg,
                    program,
                    config: config
                });

                config.env = process.env;

                config.pkg = pkg.pkg;
                config.cliContext = program;
                new ExpressionHandler(config).handle();
                delete config.env;
                delete config.pkg;
                delete config.cliContext;
            }

        }

        return <HookContext> {
            ...options,
            pkg,
            dest: 'dist',
            program
        };
    }
}
export interface ConfigurationContext extends HookContext {
    configurations: webpack.Configuration[];
}

export namespace ConfigurationContext {
    export async function create(hookContext: HookContext): Promise<ConfigurationContext> {
        const configFactory = new ConfigFactory();
        const configurations = await configFactory.create(hookContext);
        return {
            ...hookContext,
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

export namespace ContextUtils {

    export function createHooKContext(program: CommanderStatic, options: { [key: string]: any } = {}, projectPath: string = process.cwd()): Promise<HookContext> {
        return HookContext.create(program, options, projectPath);
    }

    export async function createConfigurationContext(program: CommanderStatic, options: { [key: string]: any } = {}, projectPath: string = process.cwd()): Promise<BuildContext> {
        return ConfigurationContext.create(await createHooKContext(program, options, projectPath));
    }

    export function createBuildContext(program: CommanderStatic, options: { [key: string]: any } = {}, projectPath: string = process.cwd()): Promise<BuildContext> {
        return createConfigurationContext(program, options, projectPath);
    }

    export function createDeployContext(program: CommanderStatic, options: { [key: string]: any } = {}, projectPath: string = process.cwd()): Promise<DeployContext> {
        return createConfigurationContext(program, options, projectPath);
    }

    export function createWebpackContext(program: CommanderStatic, options: { [key: string]: any } = {}, projectPath: string = process.cwd()): Promise<WebpackContext> {
        return createConfigurationContext(program, options, projectPath);
    }

    export function createInitContext(hookContext: HookContext): Promise<InitContext> {
        return ConfigurationContext.create(hookContext);
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

    export async function createConfigContext(hookContext: HookContext, config: { [key: string]: any }): Promise<ConfigContext> {
        return { ...hookContext, config };
    }

}

export interface BuildContext extends ConfigurationContext {

}

export interface InitContext extends ConfigurationContext {

}

export interface DeployContext extends ConfigurationContext {

}

export interface WebpackContext extends ConfigurationContext {

}

export interface ConfigContext extends HookContext {
    config: { [key: string]: any };

}

export interface ServeContext extends ConfigurationContext {
    server: http.Server | https.Server;
    app: any;
    compiler: webpack.Compiler;
    entryContextProvider: () => Promise<any>;
}
