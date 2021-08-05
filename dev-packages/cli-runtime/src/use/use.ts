
import { getSettings, saveSettings } from '@malagu/cli-common/lib/util';
const inquirer = require('inquirer');
const chalk = require('chalk');
import { ok } from 'assert';
import { getInstalledRuntimes } from '../util';
inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'));

export interface UseOptions {
    runtime?: string;
}

export async function selectRuntime(): Promise<string> {

    const answers = await inquirer.prompt([{
        name: 'item',
        type: 'autocomplete',
        default: getSettings().defaultRuntime || 'empty',
        pageSize: 12,
        message: 'Select a runtime to use (as default)',
        source: async (answersSoFar: any, input: string) => {
            let runtimes = await getInstalledRuntimes();
            runtimes = [ { name: 'empty', version: '' }, ...runtimes ];
            return runtimes.map(r => ({ name: chalk`${r.name} {italic.gray runtime}`, value: r }));
        }
    }]);
    return answers.item.name;
}

export default async (options: UseOptions) => {
    try {
        let runtime = options.runtime;
        if (!runtime) {
            runtime = await selectRuntime();
        } else {
            const runtimes = await getInstalledRuntimes();
            let existed = false;
            for (const r of runtimes) {
                if (r.name === runtime) {
                    existed = true;
                }
            }
            ok(existed, `"${runtime}" runtime not found`);
        }
        if (runtime) {
            const settings = getSettings();
            if (runtime === 'empty') {
                delete settings.defaultRuntime;
            } else {
                settings.defaultRuntime = runtime;
            }
            await saveSettings(settings);
        }
    } catch (error) {
        console.error(error);
        process.exit(-1);
    }

};
