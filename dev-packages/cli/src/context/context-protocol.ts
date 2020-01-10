import { ApplicationPackage } from '../package';
import webpack = require('webpack');
import * as https from 'https';
import * as http from 'http';
import { RawComponentPackage } from '../package';
import { join } from 'path';
import { ConfigFactory } from '../webpack';
import { CommanderStatic } from 'commander';
import { checkPkgVersionConsistency } from '../util';

export interface CliContext {
    program: CommanderStatic;
    pkg: ApplicationPackage;
    [key: string]: any;
}

export namespace CliContext {
    export async function create(program: CommanderStatic, mode: string[] = [], projectPath: string = process.cwd()): Promise<CliContext> {
        // at this point, we will check the core package version in the *.lock file firstly
        checkPkgVersionConsistency('@malagu/core', projectPath);

        let pkg = new ApplicationPackage({ projectPath, mode });
        if (!RawComponentPackage.is(pkg.pkg)) {
            const { malagu } = pkg.pkg;
            if (malagu && malagu.rootComponent) {
                pkg = new ApplicationPackage({ projectPath: join(projectPath, malagu.rootComponent), mode});
            }
        }
        return <CliContext> {
            pkg,
            program
        };
    }
}
export interface HookContext extends CliContext {
    configurations: webpack.Configuration[];
}

export namespace HookContext {
    export async function create(cliContext: CliContext): Promise<HookContext> {
        const configFactory = new ConfigFactory();
        const configurations = await configFactory.create(cliContext);
        return {
            ...cliContext,
            dest: 'dist',
            configurations: configurations
        };
    }

    export function getConfiguration(target: string, configurations: webpack.Configuration[]) {
        for (const c of configurations) {
            if (c.name === target) {
                return c;
            }
        }
    }
}

export interface ServeContext extends HookContext {
    server: http.Server | https.Server;
    app: any;
    compiler: webpack.Compiler;
    entryContextProvider: () => Promise<any>;
}
