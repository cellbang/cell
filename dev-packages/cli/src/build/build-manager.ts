
import * as webpack from 'webpack';
import * as FriendlyErrorsWebpackPlugin from 'friendly-errors-webpack-plugin';
import { HookContext } from '../context';
import { BACKEND_TARGET } from '../constants';
import { packExternalModules } from '../external';
import { HookExecutor } from '../hook';
const chalk = require('chalk');

export class BuildManager {

    constructor(protected readonly hookContext: HookContext) {

    }

    async build(): Promise<void> {
        if (this.hookContext.configurations.length === 0) {
            throw new Error('No malagu module found.');
        }

        console.log('compiling...');
        for (const configuration of this.hookContext.configurations) {
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
                    packExternalModules(this.hookContext, stats);
                }
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            }));
        }
        const hookExecutor = new HookExecutor();
        await hookExecutor.executeBuildHooks(this.hookContext);
    }

}
