import * as fs from 'fs';
import * as net from 'net';
import { resolve } from 'path';
import webpack = require('webpack');
const Server = require('webpack-dev-server/lib/Server');
const setupExitSignals = require('webpack-dev-server/lib/utils/setupExitSignals');
const colors = require('webpack-dev-server/lib/utils/colors');
const processOptions = require('webpack-dev-server/lib/utils/processOptions');
const createLogger = require('webpack-dev-server/lib/utils/createLogger');
const findPort = require('webpack-dev-server/lib/utils/findPort');
import { ExecuteServeHooks } from './serve-manager';
import { BACKEND_TARGET, FRONTEND_TARGET } from '@malagu/cli-common';
import * as delay from 'delay';
import * as WebpackChain from 'webpack-chain';
const clearModule = require('clear-module');

let server: any;

function createCompiler(configuration: webpack.Configuration, options: any, log: any) {
    try {
        return webpack(configuration);
    } catch (err) {
        if (err instanceof (webpack as any).WebpackOptionsValidationError) {
            log.error(colors.error(options.stats.colors, err.message));
            process.exit(1);
        }
        throw err;
    }

}

function getEntryPath(configuration: webpack.Configuration) {
    const { path, filename } = configuration.output as any;
    return resolve(path as string, filename);
}

function attachBackendServer(executeServeHooks: ExecuteServeHooks, configuration: webpack.Configuration, options: any, log: any, c?: webpack.Compiler) {
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
        clearModule(entryPath);
        clearModule.match(/node_modules/);
        while (true) {
            if (fs.existsSync(entryPath)) {
                return require(entryPath);
            }
            await delay(200);
        }
    };
    executeServeHooks(server.listeningApp, server.app, compiler, entryContextProvider);

}

function doStartDevServer(configurations: webpack.Configuration[], options: any, executeServeHooks: ExecuteServeHooks) {
    const log = createLogger(options);
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
        log.error(colors.error(options.stats.colors, 'No suitable target found.'));
        process.exit(-1);
    }
    const compiler = createCompiler(configuration, options, log);

    try {
        server = new Server(compiler, options, log);
        setupExitSignals(server);
        if (frontendConfiguration && backendConfiguration) {
            attachBackendServer(executeServeHooks, backendConfiguration, options, log);
        } else if (configuration.name === BACKEND_TARGET) {
            attachBackendServer(executeServeHooks, configuration, options, log, compiler);
        }
    } catch (err) {
        if (err.name === 'ValidationError') {
            log.error(colors.error(options.stats.colors, err.message));
            process.exit(1);
        }

        throw err;
    }

    if (options.socket) {
        server.listeningApp.on('error', (e: any) => {
            if (e.code === 'EADDRINUSE') {
                const clientSocket = new net.Socket();

                clientSocket.on('error', (err: any) => {
                    if (err.code === 'ECONNREFUSED') {
                        // No other server listening on this socket so it can be safely removed
                        fs.unlinkSync(options.socket);

                        server.listen(options.socket, options.host, (error: Error | undefined) => {
                            if (error) {
                                throw error;
                            }
                        });
                    }
                });

                clientSocket.connect({ path: options.socket }, () => {
                    throw new Error('This socket is already used');
                });
            }
        });

        server.listen(options.socket, options.host, (err: Error | undefined) => {
            if (err) {
                throw err;
            }

            // chmod 666 (rw rw rw)
            const READ_WRITE = 438;

            fs.chmod(options.socket, READ_WRITE, e => {
                if (e) {
                    throw e;
                }
            });
        });
    } else {
        findPort(options.port)
            .then((port: any) => {
                options.port = port;
                server.listen(options.port, options.host, (err: Error | undefined) => {
                    if (err) {
                        throw err;
                    }
                });
            })
            .catch((err: Error) => {
                throw err;
            });
    }

    return compiler;
}

export function startDevServer(configurations: WebpackChain[], executeServeHooks: ExecuteServeHooks) {
    processOptions(configurations.map(c => c.toConfig()), { info: false }, (cs: any, options: any) => {
        doStartDevServer(cs, options, executeServeHooks);
    });
}
