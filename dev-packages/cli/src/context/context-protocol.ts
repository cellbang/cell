import * as path from 'path';
import * as fs from 'fs';
import { CONFIG_FILE } from '../constants';
import { ApplicationPackage } from '../package';
import webpack = require('webpack');
import * as https from 'https';
import * as http from 'http';

export interface CliContext {
    pkg: ApplicationPackage,
    dev: boolean;
    config: any;
    copy: boolean,
    open: boolean,
    dest: string,
    port: number,
    entry?: string
}

export namespace CliContext {
    export async function create(projectPath: string = process.cwd()): Promise<CliContext> {
        const pkg = new ApplicationPackage({ projectPath });
        const configPath = path.resolve(projectPath, CONFIG_FILE);
        const config = fs.existsSync(configPath) ? require(configPath) : {};
        return <CliContext> {
            pkg,
            dev: false,
            config,
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
    entryContextProvider: () => any;
}
