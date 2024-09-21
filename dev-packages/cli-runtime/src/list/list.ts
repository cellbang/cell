
import { SettingsUtil } from '@celljs/cli-common/lib/settings/settings-util';
import { Runtimes } from '../runtime-protocol';
const chalk = require('chalk');
import { RuntimeUtil } from '../util/index';

export interface ListOptions {
}

export default async (options: ListOptions) => {
    try {
        const { defaultRuntime } = SettingsUtil.getSettings();
        let runtimes = await RuntimeUtil.getInstalledRuntimes();
        runtimes = [ { name: Runtimes.empty, version: '' }, ...runtimes ];
        for (const runtime of runtimes) {
            console.log(chalk
                `${ defaultRuntime === runtime.name || !defaultRuntime && runtime.name === Runtimes.empty ? chalk.green('*') : ' ' } ${runtime.name} {italic.gray runtime}`);
        }
        console.log();
    } catch (error) {
        console.error(error);
        process.exit(-1);
    }

};
