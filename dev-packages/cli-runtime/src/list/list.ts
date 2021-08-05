
import { getSettings } from '@malagu/cli-common/lib/util';
const chalk = require('chalk');
import { getInstalledRuntimes } from '../util';

export interface ListOptions {
}

export default async (options: ListOptions) => {
    try {
        const { defaultRuntime } = getSettings();
        let runtimes = await getInstalledRuntimes();
        runtimes = [ { name: 'empty', version: '' }, ...runtimes ];
        for (const runtime of runtimes) {
            console.log(chalk`${ defaultRuntime === runtime.name || !defaultRuntime && runtime.name === 'empty' ? chalk.green('*') : ' ' } ${runtime.name} {italic.gray runtime}`);
        }
        console.log();
    } catch (error) {
        console.error(error);
        process.exit(-1);
    }

};
