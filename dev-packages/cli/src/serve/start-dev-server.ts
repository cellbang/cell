import * as fs from 'fs';
import * as net from 'net';
import webpack = require('webpack');
const Server = require('webpack-dev-server/lib/Server');
const setupExitSignals = require('webpack-dev-server/lib/utils/setupExitSignals');
const colors = require('webpack-dev-server/lib/utils/colors');
const processOptions = require('webpack-dev-server/lib/utils/processOptions');
const createLogger = require('webpack-dev-server/lib/utils/createLogger');
const findPort = require('webpack-dev-server/lib/utils/findPort');
import * as FriendlyErrorsWebpackPlugin from 'friendly-errors-webpack-plugin';
import { getDevSuccessInfo } from '../webpack/utils';
const webpackDevMiddleware = require('webpack-dev-middleware');
import { ExecuteServeHooks } from './serve-manager';

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

function attachBackendServerIfNeed(executeServeHooks: ExecuteServeHooks, server: any, configuration: webpack.Configuration, options: any, log: any) {
    const compiler = createCompiler(configuration, options, log);
    server.app.use(webpackDevMiddleware(compiler));
    executeServeHooks(server.listeningApp, server.app, compiler);
}

function doStartDevServer(configurations: webpack.Configuration[], options: any, executeServeHooks: ExecuteServeHooks) {
    const log = createLogger(options);

    const [configuration, backendConfiguration] = configurations;

    let compiler: webpack.Compiler;

    compiler = createCompiler(configuration, options, log);
    new FriendlyErrorsWebpackPlugin({
        compilationSuccessInfo: {
            messages: getDevSuccessInfo((configuration as any).devServer),
            notes: []
        }
    }).apply(compiler);

    try {
        server = new Server(compiler, options, log);
        setupExitSignals(server);
        attachBackendServerIfNeed(executeServeHooks, server, backendConfiguration, options, log);
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

            fs.chmod(options.socket, READ_WRITE, (err) => {
                if (err) {
                    throw err;
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

export function startDevServer(configurations: webpack.Configuration[], executeServeHooks: ExecuteServeHooks) {
    processOptions(configurations, { info: false }, (configurations: any, options: any) => {
        doStartDevServer(configurations, options, executeServeHooks);
    });
}
