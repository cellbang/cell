
import * as program from 'commander';
import { ConfigFactory } from '../webpack/config/config-factory';
import { Context } from '../webpack/config/context';
import { startDevServer } from './start-dev-server';
import webpack = require('webpack');
const MemoryFS = require('memory-fs');

program
    .name('malagu serve')
    .usage('[options]')
    .option('-o, --open [open]', 'Open browser')
    .option('-c, --copy [copy]', 'Copy local url to clipboard')
    .option('-p, --port <port>', 'Port used by the server', 3000)
    .description('serve a applicaton')
    .parse(process.argv);

(async () => {
    const context = await Context.create();
    context.dev = true;
    context.open = program.open;
    context.copy = program.copy;
    context.port = program.port;
    const configFactory = new ConfigFactory();
    const configurations = await configFactory.create(context);
    let c: webpack.Configuration;
    const mfs = new MemoryFS();
    if (configurations.length > 1) {
        c = configurations[0];
        const frontendCompiler = webpack(c);
        frontendCompiler.outputFileSystem = mfs;
        frontendCompiler.run(() => {
            c = configurations[1];
            startDevServer(c, { info: false }, mfs);
        });
    } else {
        c = configurations[0];
        startDevServer(c, { info: true }, mfs);
    }

})();

