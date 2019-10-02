
import * as program from 'commander';
import * as webpack from 'webpack';
import { ConfigFactory } from '../webpack/config/config-factory';
import * as FriendlyErrorsWebpackPlugin from 'friendly-errors-webpack-plugin';
import { CliContext } from '../context';
const chalk = require('chalk');

program
    .name('malagu build')
    .usage('[options]')
    .option('-d, --dest [dir]', 'output directory', 'dist')
    .description('build a application')
    .parse(process.argv);

(async () => {
    const context = await CliContext.create();
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
