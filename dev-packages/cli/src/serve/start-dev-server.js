"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var net = require("net");
var vm = require("vm");
var path = require("path");
var webpack = require("webpack");
var Server = require('webpack-dev-server/lib/Server');
var setupExitSignals = require('webpack-dev-server/lib/utils/setupExitSignals');
var colors = require('webpack-dev-server/lib/utils/colors');
var processOptions = require('webpack-dev-server/lib/utils/processOptions');
var createLogger = require('webpack-dev-server/lib/utils/createLogger');
var findPort = require('webpack-dev-server/lib/utils/findPort');
var FriendlyErrorsWebpackPlugin = require("friendly-errors-webpack-plugin");
var utils_1 = require("../webpack/utils");
var expressWs = require("express-ws");
var server;
setupExitSignals(server);
function doStartDevServer(config, options, mfs) {
    var log = createLogger(options);
    var compiler;
    try {
        compiler = webpack(config);
        compiler.outputFileSystem = mfs;
        new FriendlyErrorsWebpackPlugin({
            compilationSuccessInfo: {
                messages: utils_1.getDevSuccessInfo(config.devServer),
                notes: []
            }
        }).apply(compiler);
    }
    catch (err) {
        if (err instanceof webpack.WebpackOptionsValidationError) {
            log.error(colors.error(options.stats.colors, err.message));
            process.exit(1);
        }
        throw err;
    }
    try {
        server = new Server(compiler, options, log);
        var ws_1 = expressWs(server.app, server.listeningApp);
        var oldCreateReadStream_1 = fs.createReadStream;
        fs.createReadStream = function (path, options) {
            if (path.toString().startsWith(config.devServer.contentBase)) {
                return mfs.createReadStream(path, options);
            }
            return oldCreateReadStream_1(path, options);
        };
        var oldStat_1 = fs.stat;
        fs.stat = function (path, callback) {
            if (path.toString().startsWith(config.devServer.contentBase)) {
                mfs.stat(path, function (err, stat) {
                    if (!err) {
                        stat.mtime = new Date();
                    }
                    callback(err, stat);
                });
            }
            else {
                oldStat_1(path, callback);
            }
        };
        server.app.ws('/api', function (s) {
            var entryPath = path.resolve(config.output.path, config.output.filename);
            var source = mfs.readFileSync(entryPath, 'utf8');
            var wrapper = "(function (exports, require, module, __filename, __dirname, __request) { \n                " + source + "\n            })";
            var filename = path.basename(entryPath);
            var compiled = vm.runInThisContext(wrapper, {
                filename: filename,
                lineOffset: 0,
                displayErrors: true
            });
            var exports = {};
            var module = { exports: exports };
            compiled(exports, require, module, filename, path.dirname(filename));
            var _a = module.exports, container = _a.container, Context = _a.Context, WebSocketContext = _a.WebSocketContext, Dispatcher = _a.Dispatcher;
            container.then(function (c) {
                var dispatcher = c.get(Dispatcher);
                Context.run(function () { return new WebSocketContext(ws_1.getWss(), s, dispatcher); });
            });
        });
    }
    catch (err) {
        if (err.name === 'ValidationError') {
            log.error(colors.error(options.stats.colors, err.message));
            process.exit(1);
        }
        throw err;
    }
    if (options.socket) {
        server.listeningApp.on('error', function (e) {
            if (e.code === 'EADDRINUSE') {
                var clientSocket = new net.Socket();
                clientSocket.on('error', function (err) {
                    if (err.code === 'ECONNREFUSED') {
                        // No other server listening on this socket so it can be safely removed
                        fs.unlinkSync(options.socket);
                        server.listen(options.socket, options.host, function (error) {
                            if (error) {
                                throw error;
                            }
                        });
                    }
                });
                clientSocket.connect({ path: options.socket }, function () {
                    throw new Error('This socket is already used');
                });
            }
        });
        server.listen(options.socket, options.host, function (err) {
            if (err) {
                throw err;
            }
            // chmod 666 (rw rw rw)
            var READ_WRITE = 438;
            fs.chmod(options.socket, READ_WRITE, function (err) {
                if (err) {
                    throw err;
                }
            });
        });
    }
    else {
        findPort(options.port)
            .then(function (port) {
            options.port = port;
            server.listen(options.port, options.host, function (err) {
                if (err) {
                    throw err;
                }
            });
        })
            .catch(function (err) {
            throw err;
        });
    }
    return compiler;
}
function startDevServer(config, options, mfs) {
    processOptions(config, options, function (config, options) {
        doStartDevServer(config, options, mfs);
    });
}
exports.startDevServer = startDevServer;
//# sourceMappingURL=start-dev-server.js.map