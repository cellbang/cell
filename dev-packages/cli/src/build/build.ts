
import * as program from 'commander';
import * as webpack from 'webpack';
import { ConfigFactory } from '../webpack/config/config-factory';
import { Context } from '../webpack/config/context';
import * as FriendlyErrorsWebpackPlugin from 'friendly-errors-webpack-plugin';
const chalk = require('chalk');

program
    .name('malagu build')
    .usage('[options]')
    .option('-d, --dest [dir]', 'output directory', 'dist')
    .description('build a application')
    .parse(process.argv);

(async () => {
    const context = await Context.create();
    context.dev = false;
    if (program.dir) {
        context.dest = program.dir;
    }
    const configFactory = new ConfigFactory();
    const configurations = await configFactory.create(context);
    if (configurations.length === 0) {
        throw new Error('No malagu module found.');
    }

    for (const configuration of configurations) {
        const compiler = webpack(configuration);
        new FriendlyErrorsWebpackPlugin({
            compilationSuccessInfo: {
                messages: [ `The ${configuration.name} application code output to ${chalk.green(configuration.output && configuration.output.path)}` ],
                notes: []
            },
            clearConsole: false
        }).apply(compiler);
        compiler.run((err, stats) => {});
    }
})();
