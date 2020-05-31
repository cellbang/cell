
import * as webpack from 'webpack';
import * as FriendlyErrorsWebpackPlugin from 'friendly-errors-webpack-plugin';
import { BuildContext } from '../context';
import { BACKEND_TARGET } from '../constants';
import { packExternalModules } from '../external';
import { HookExecutor } from '../hook';
const chalk = require('chalk');

export class BuildManager {

    constructor(protected readonly ctx: BuildContext) {

    }

    async build(): Promise<void> {
        if (this.ctx.configurations.length === 0) {
            throw new Error('No malagu module found.');
        }

        console.log('compiling...');
        for (const configuration of this.ctx.configurations) {
            const compiler = webpack(configuration);
            new FriendlyErrorsWebpackPlugin({
                compilationSuccessInfo: {
                    messages: [ `The ${configuration.name} code output to ${chalk.bold.blue(configuration.output && configuration.output.path)}` ],
                    notes: []
                },
                clearConsole: false
            }).apply(compiler);
            await new Promise((resolve, reject) => compiler.run((err, stats) => {
                if (configuration.name === BACKEND_TARGET) {
                    packExternalModules(this.ctx, stats);
                }
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            }));
        }
        const hookExecutor = new HookExecutor();
        await hookExecutor.executeBuildHooks(this.ctx);
    }

}
