
import * as program from 'commander';
import * as webpack from 'webpack';
import * as FriendlyErrorsWebpackPlugin from 'friendly-errors-webpack-plugin';
import { CliContext, HookContext } from '../context';
import { packExternalModules } from '../external';
import { BACKEND_TARGET } from '../constants';
const chalk = require('chalk');
import { HookExecutor } from '../hook/hook-executor';

program
    .name('malagu build')
    .usage('[options]')
    .option('-m, --mode [mode]', 'Specify application mode', value => value ? value.split(',') : [])
    .description('build a application')
    .parse(process.argv);
(async () => {
    const mode = Array.from(new Set<string>([...(program.mode || [])]));
    const cliContext = await CliContext.create(program, mode);
    cliContext.dev = false;
    cliContext.mode = mode;
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
        await new Promise((resolve, reject) => compiler.run((err, stats) => {
            if (configuration.name === BACKEND_TARGET) {
                packExternalModules(hookContext, stats);
            }
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        }));
    }
    const hookExecutor = new HookExecutor();
    await hookExecutor.executeBuildHooks(hookContext);
})().catch(err => {
    console.error(err);
    process.exit(-1);
});
