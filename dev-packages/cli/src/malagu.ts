import { fork, ChildProcess } from 'child_process';
import { Component, Module } from '@malagu/cli-common';
import { join, sep } from 'path';
const Watchpack = require('watchpack');

const watchpack = new Watchpack({});

const argv = process.argv;
argv.shift();
argv.shift();

let current: ChildProcess;

interface Data {
    components: Component[];
    configHookModules: Module[];
    webpackHookModules: Module[];
    serveHookModules: Module[];
    buildHookModules: Module[];
    deployHookModules: Module[];
}

// eslint-disable-next-line no-null/no-null
const exitListener = (code: number | null) => code !== null && process.exit(code);

function execute() {
    if (current?.killed === false) {
        current.removeListener('exit', exitListener);
        current.kill();
    }
    current = fork(join(__dirname, 'malagu-main.js'), argv, { stdio: 'inherit' });
    // eslint-disable-next-line no-null/no-null
    current.on('exit', exitListener);
    current.on('message', (messageEvent: MessageEvent<Data>) => {
        if (messageEvent.type === 'cliContext') {
            const { components, webpackHookModules, configHookModules, buildHookModules, serveHookModules, deployHookModules } = messageEvent.data;
            const files = [
                ...webpackHookModules.map(m => m.path),
                ...configHookModules.map(m => m.path),
                ...buildHookModules.map(m => m.path),
                ...serveHookModules.map(m => m.path),
                ...deployHookModules.map(m => m.path),
                ...components.reduce<string[]>((prev, curr) => prev.concat(curr.configFiles), [])
            ];
            watchpack.watch({
                files: files.map(f => f.split('/').join(sep))
            });
            watchpack.on('aggregated', () => {
                execute();
            });
        }
    });
}

function exit() {
    if (current?.killed === false) {
        current.kill();
    }
    watchpack.close();
}

process.on('exit', exit);

try {
    execute();
} catch (error) {
    exit();
    process.exit(-1);
}
