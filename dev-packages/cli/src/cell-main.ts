import { fork, ChildProcess } from 'child_process';
import { PathUtil } from '@celljs/cli-common/lib/utils/path-util';
import { Component, Module } from '@celljs/cli-common/lib/package/package-protocol';
import { CommandUtil } from '@celljs/cli-common/lib/utils/command-util';
import { sep, join, delimiter, dirname, resolve } from 'path';
import { RuntimeUtil } from '@celljs/cli-runtime/lib/util/runtime-util';
import { config } from 'dotenv';
const Watchpack = require('watchpack');
config();

const argv = [ ...process.argv ];
argv.shift();
argv.shift();

let current: ChildProcess;

interface Data {
    components?: Component[];
    configHookModules?: Module[];
    webpackHookModules?: Module[];
    serveHookModules?: Module[];
    buildHookModules?: Module[];
    deployHookModules?: Module[];
    propsHookModules?: Module[];
    infoHookModules?: Module[];
}

const exitListener = (code: number | null) => {
    // eslint-disable-next-line no-null/no-null
    if (code !== null) {
        process.exit(code);
    } else {
        process.exit(-1);
    }

};

async function execute() {
    const pkg = CommandUtil.getPkg();
    let projectPath = pkg.rootComponentPackage.cellComponent?.projectPath;
    projectPath = projectPath ? resolve(process.cwd(), projectPath) : process.cwd();
    try {
        const cellMainPath = require.resolve('@celljs/cli/lib/cell-main', { paths: [ projectPath ] });
        if (dirname(cellMainPath) !== __dirname) {
            const subprocess = fork(cellMainPath, argv, { stdio: 'inherit', cwd: projectPath });
            subprocess.on('exit', exitListener);
            subprocess.on('error', () => process.exit(-1));
            return;
        }
    } catch (error) {
        if (error?.code !== 'MODULE_NOT_FOUND') {
            throw error;
        }
    }

    if (current?.killed === false) {
        current.removeListener('exit', exitListener);
        current.kill();
    }
    const { runtime, framework, settings } = await RuntimeUtil.initRuntime(projectPath);

    const nodePaths = Array.from(new Set<string>([
        join(projectPath, 'node_modules'),
        join(projectPath, '..', 'node_modules'),
        join(projectPath, '..', '..', 'node_modules'),
        join(projectPath, '..', '..', '..', 'node_modules')
    ]));

    process.env.MALAGU_RFS = JSON.stringify({ runtime, settings, framework });
    const runtimePath = PathUtil.getRuntimePath(runtime);
    if (runtimePath !== projectPath) {
        nodePaths.push(join(runtimePath, 'node_modules'));
    }
    process.env.NODE_PATH = nodePaths.join(delimiter);
    const cellPath = require.resolve('@celljs/cli/lib/cell', { paths: [ __dirname ] });
    current = fork(cellPath, argv, { stdio: 'inherit', cwd: projectPath });
    // eslint-disable-next-line no-null/no-null
    current.on('exit', exitListener);
    current.on('error', () => process.exit(-1));
    current.on('message', (messageEvent: MessageEvent<Data>) => {
        if (messageEvent.type === 'cliContext') {
            const { components, webpackHookModules, configHookModules, buildHookModules,
                serveHookModules, deployHookModules, propsHookModules, infoHookModules } = messageEvent.data;
            const files = [
                ...(webpackHookModules || []).map(m => m.path),
                ...(configHookModules || []).map(m => m.path),
                ...(buildHookModules || []).map(m => m.path),
                ...(serveHookModules || []).map(m => m.path),
                ...(deployHookModules || []).map(m => m.path),
                ...(propsHookModules || []).map(m => m.path),
                ...(infoHookModules || []).map(m => m.path),
                ...(components || []).reduce<string[]>((prev, curr) => prev.concat(curr.configFiles), [])
            ];
            const watchpack = new Watchpack({
                aggregateTimeout: 1500
            });
            watchpack.watch({
                files: files.map(f => f?.split('/').join(sep))
            });
            watchpack.on('aggregated', () => {
                watchpack.close();
                execute();
            });
        } else if (messageEvent.type === 'address') {
            if (process.send) {
                process.send(messageEvent);
            }
        }
    });
}

function exit() {
    if (current?.killed === false) {
        current.kill();
    }
}

process.on('exit', exit);
process.on('SIGINT', exit);
try {
    execute();
} catch (error) {
    exit();
    process.exit(-1);
}
