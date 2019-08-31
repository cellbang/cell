import * as path from 'path';
import * as fs from 'fs';
import { CONFIG_FILE } from '../../constants';
import { ApplicationPackage } from '../../package';
export interface Context {
    pkg: ApplicationPackage,
    dev: boolean;
    config: any;
    copy: boolean,
    open: boolean,
    dest: string,
    port: number,
    entry?: string
}

export namespace Context {
    export async function create(projectPath: string = process.cwd()): Promise<Context> {
        const pkg = new ApplicationPackage({ projectPath });
        const configPath = path.resolve(projectPath, CONFIG_FILE);
        const config = fs.existsSync(configPath) ? require(configPath) : {};
        return <Context> {
            pkg,
            dev: false,
            config,
            copy: false,
            open: false,
            dest: 'dist'
        };
    }
}
