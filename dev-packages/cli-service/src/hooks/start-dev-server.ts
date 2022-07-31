import * as fs from 'fs';
import { resolve } from 'path';
import webpack = require('webpack');
const Server = require('webpack-dev-server/lib/Server');
import { Callback } from './serve';
import { BACKEND_TARGET, FRONTEND_TARGET } from '@malagu/cli-common/lib/constants';
import * as delay from 'delay';
import { ConfigurationContext } from '../context/context-protocol';
const clearModule = require('clear-module');

let server: any;
let moduleCaches: string[] = [];
let mounted = false;

function createCompiler(configuration: webpack.Configuration, options: any, log: any) {
    try {
        return webpack(configuration);
    } catch (err) {
        if (err instanceof (webpack as any).WebpackOptionsValidationError) {
            log.error(err.message);
            process.exit(1);
        }
        throw err;
    }

}

function getEntryPath(configuration: webpack.Configuration) {
    const { path } = configuration.output as any;
    return resolve(path as string, 'index.js');
}

function mountRuntimeModuleCaches() {
    if (mounted) {
        return;
    }
    mounted = true;
    const BuiltinModule = require('module');
    const Module = module.constructor.length > 1 ? module.constructor : BuiltinModule;
    const originResolveFilename = Module._resolveFilename.bind(Module);
    Module._resolveFilename = (...args: any[]) => {
        const filename = originResolveFilename(...args);
        if (!moduleCaches.includes(filename)) {
            moduleCaches.push(filename);
        }
        return filename;
    };
}

function clearRuntimeModuleCaches() {
    for (const cache of moduleCaches) {
        clearModule.single(cache);
    }
    moduleCaches = [];
}

async function attachBackendServer(ctx: ConfigurationContext, callback: Callback, configuration: webpack.Configuration, options: any, log: any, c?: webpack.Compiler) {
    const compiler = c || createCompiler(configuration, options, log);
    if (!c) {
        compiler.watch(options.watchOptions, err => {
            if (err) {
                log.error(err.stack || err);
            }
        });
    }
    const entryContextProvider = async () => {
        const entryPath = getEntryPath(configuration);
        clearRuntimeModuleCaches();
        while (true) {
            if (fs.existsSync(entryPath)) {
                mountRuntimeModuleCaches();
                return require(entryPath);
            }
            await delay(200);
        }
    };
    await callback(server.server, server.app, compiler, entryContextProvider);

}

async function doStartDevServer(ctx: ConfigurationContext, configurations: webpack.Configuration[], options: any, callback: Callback) {
    let frontendConfiguration: webpack.Configuration | undefined;
    let backendConfiguration: webpack.Configuration | undefined;
    for (const c of configurations) {
        if (c.name === FRONTEND_TARGET) {
            frontendConfiguration = c;
        } else {
            backendConfiguration = c;
        }
    }
    const configuration = frontendConfiguration || backendConfiguration;
    if (!configuration) {
        console.error('No suitable target found.');
        process.exit(-1);
    }
    const compiler = createCompiler(configuration, options, console);

    try {
        server = new Server(options, compiler);
        await server.start();
        if (frontendConfiguration && backendConfiguration) {
           await attachBackendServer(ctx, callback, backendConfiguration, options, console);
        } else if (configuration.name === BACKEND_TARGET) {
            await attachBackendServer(ctx, callback, configuration, options, console, compiler);
        }
        process.send!({ type: 'address', data: server.server?.address() });
    } catch (err) {
        if (err.name === 'ValidationError') {
            console.error(err.message);
        } else {
            console.error(err);
        }
        process.exit(2);
    }

    return compiler;
}

export function startDevServer(ctx: ConfigurationContext, callback: Callback) {
    const cs = ctx.configurations.map(c => c.toConfig());
    const devServer = (cs[cs.length - 1] as any).devServer;
    return doStartDevServer(ctx, cs, { ...devServer }, callback);
}
