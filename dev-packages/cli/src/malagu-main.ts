import { fork, ChildProcess } from 'child_process';
import { Component, Module, PathUtil } from '@malagu/cli-common';
import { sep, join, delimiter } from 'path';
import { RuntimeUtil } from '@malagu/cli-runtime';
const Watchpack = require('watchpack');

const watchpack = new Watchpack({});

const argv = process.argv;
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
    if (current?.killed === false) {
        current.removeListener('exit', exitListener);
        current.kill();
    }
    const { runtime, framework, settings } = await RuntimeUtil.initRuntime();

    const nodePaths = Array.from(new Set<string>([
        join(process.cwd(), 'node_modules'),
        join(process.cwd(), '..', 'node_modules'),
        join(process.cwd(), '..', '..', 'node_modules'),
        join(process.cwd(), '..', '..', '..', 'node_modules')
    ]));

    process.env.MALAGU_RFS = JSON.stringify({ runtime, settings, framework });
    const runtimePath = PathUtil.getRuntimePath(runtime);
    if (runtimePath !== process.cwd()) {
        nodePaths.push(join(runtimePath, 'node_modules'));
    }
    process.env.NODE_PATH = nodePaths.join(delimiter);
    const malaguPath = require.resolve('@malagu/cli/lib/malagu', { paths: [ process.cwd(), __dirname ] });
    current = fork(malaguPath, argv, { stdio: 'inherit' });
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
            watchpack.watch({
                files: files.map(f => f?.split('/').join(sep)),
                aggregateTimeout: 1000
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
process.on('SIGINT', exit);
try {
    execute();
} catch (error) {
    exit();
    process.exit(-1);
}
