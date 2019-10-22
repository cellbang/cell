
import * as program from 'commander';
import * as webpack from 'webpack';
import * as FriendlyErrorsWebpackPlugin from 'friendly-errors-webpack-plugin';
import { CliContext, HookContext } from '../context';
import { packExternalModules } from '../extarnal';
import { BACKEND_TARGET } from '../constants';
const chalk = require('chalk');

program
    .name('malagu build')
    .usage('[options]')
    .option('-d, --dest [dir]', 'output directory', 'dist')
    .option('-m, --mode [mode]', 'Specify application mode')
    .description('build a application')
    .parse(process.argv);

(async () => {
    const cliContext = await CliContext.create(program);
    cliContext.dev = false;
    cliContext.dest = program.dir;
    cliContext.mode = program.mode;
    const hookContext = await HookContext.create(cliContext);

    if (hookContext.configurations.length === 0) {
        throw new Error('No malagu module found.');
    }

    console.log('compiling...');
    for (const configuration of hookContext.configurations) {
        const compiler = webpack(configuration);
        new FriendlyErrorsWebpackPlugin({
            compilationSuccessInfo: {
                messages: [ `The ${configuration.name} code output to ${chalk.green(configuration.output && configuration.output.path)}` ],
                notes: []
            },
            clearConsole: false
        }).apply(compiler);
        compiler.run((err, stats) => {
            if (configuration.name === BACKEND_TARGET) {
                packExternalModules(hookContext, stats);
            }
        });
    }
})();
