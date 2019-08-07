import * as fs from 'fs';
import * as net from 'net';
import * as vm from 'vm';
import * as path from 'path';
import webpack = require('webpack');
const Server = require('webpack-dev-server/lib/Server');
const setupExitSignals = require('webpack-dev-server/lib/utils/setupExitSignals');
const colors = require('webpack-dev-server/lib/utils/colors');
const processOptions = require('webpack-dev-server/lib/utils/processOptions');
const createLogger = require('webpack-dev-server/lib/utils/createLogger');
const findPort = require('webpack-dev-server/lib/utils/findPort');
import * as FriendlyErrorsWebpackPlugin from 'friendly-errors-webpack-plugin';
import { getDevSuccessInfo } from '../webpack/utils';
import * as expressWs from 'express-ws';

let server: any;

setupExitSignals(server);

function doStartDevServer(config: any, options: any, mfs: any) {
    const log = createLogger(options);

    let compiler: webpack.Compiler;

    try {
        compiler = webpack(config);
        compiler.outputFileSystem = mfs;
        new FriendlyErrorsWebpackPlugin({
            compilationSuccessInfo: {
                messages: getDevSuccessInfo(config.devServer),
                notes: []
            }
        }).apply(compiler);
    } catch (err) {
        if (err instanceof (webpack as any).WebpackOptionsValidationError) {
            log.error(colors.error(options.stats.colors, err.message));
            process.exit(1);
        }

        throw err;
    }

    try {
        server = new Server(compiler, options, log);
        const ws = expressWs(server.app, server.listeningApp);
        const oldCreateReadStream = fs.createReadStream;
        (fs as any).createReadStream = (path: any, options: any) => {
            if (path.toString().startsWith(config.devServer.contentBase)) {
                return mfs.createReadStream(path, options);
            }
            return oldCreateReadStream(path, options);
        };
        const oldStat = fs.stat;

        (fs as any).stat = (path: fs.PathLike, callback: (err: NodeJS.ErrnoException, stats: fs.Stats) => void) => {
            if (path.toString().startsWith(config.devServer.contentBase)) {
                mfs.stat(path, (err: any, stat: any) => {
                    if (!err) {
                        stat.mtime = new Date();
                    }
                    callback(err, stat);
                });
            } else {
                oldStat(path, callback);
            }
        };
        server.app.ws('/api', (s: any) => {
            const entryPath = path.resolve(config.output.path, config.output.filename);
            const source = mfs.readFileSync(entryPath, 'utf8');
            const wrapper = `(function (exports, require, module, __filename, __dirname, __request) { 
                ${source}
            })`;
            const filename = path.basename(entryPath);
            const compiled = vm.runInThisContext(wrapper, {
                filename,
                lineOffset: 0,
                displayErrors: true
            });
            const exports: any = {};
            const module = { exports };
            compiled(exports, require, module, filename, path.dirname(filename));
            const { container, Context, WebSocketContext, Dispatcher } = module.exports;
            container.then((c: any) => {
                const dispatcher = c.get(Dispatcher);
                Context.run(() => new WebSocketContext(ws.getWss(), s, dispatcher));
            });
        });
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

export function startDevServer(config: any, options: any, mfs: any) {
    processOptions(config, options, (config: any, options: any) => {
        doStartDevServer(config, options, mfs);
    });
}
