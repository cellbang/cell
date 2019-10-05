import { ApplicationPackage } from '../package';
import webpack = require('webpack');
import * as https from 'https';
import * as http from 'http';
import { RawComponentPackage } from '../package';
import { join } from 'path';

export interface CliContext {
    pkg: ApplicationPackage,
    dev: boolean;
    copy: boolean,
    open: boolean,
    dest: string,
    port: number,
    entry?: string
}

export namespace CliContext {
    export async function create(projectPath: string = process.cwd()): Promise<CliContext> {
        let pkg = new ApplicationPackage({ projectPath });
        if (!RawComponentPackage.is(pkg.pkg)) {
            const { malagu } = pkg.pkg;
            if (malagu && malagu.rootComponent) {
                pkg = new ApplicationPackage({ projectPath: join(projectPath, malagu.rootComponent)});
            }
        }
        return <CliContext> {
            pkg,
            dev: false,
            copy: false,
            open: false,
            dest: 'dist'
        };
    }
}
export interface HookContext {
    pkg: ApplicationPackage;
    cliContext: CliContext;
    configurations: webpack.Configuration[];
}

export interface ServeContext extends HookContext {
    server: http.Server | https.Server;
    app: any;
    compiler: webpack.Compiler;
    entryContextProvider: () => Promise<any>;
}
