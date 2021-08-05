
import { getRuntimePath, getSettings, saveSettings } from '@malagu/cli-common/lib/util';
const rimraf = require('rimraf');
import { existsSync } from 'fs-extra';
import { getInstalledRuntimes } from '../util';
const inquirer = require('inquirer');
const chalk = require('chalk');
import * as ora from 'ora';
inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'));

export interface UninstallOptions {
    runtime?: string;
}

export async function selectRuntime(): Promise<string> {
    const answers = await inquirer.prompt([{
        name: 'item',
        type: 'autocomplete',
        pageSize: 12,
        message: 'Select a runtime to uninstall',
        source: async (answersSoFar: any, input: string) => {
            const runtimes = await getInstalledRuntimes();
            return runtimes.map(r => ({ name: chalk`${r.name} {italic.gray runtime}`, value: r }));
        }
    }]);
    return answers.item.name;
}

export default async (options: UninstallOptions) => {
    try {
        let runtime = options.runtime;
        if (!runtime) {
            runtime = await selectRuntime();
        }
        if (runtime) {
            const runtimePath = getRuntimePath(runtime);
            if (existsSync(runtimePath)) {
                const spinner = ora({ text: 'Uninstall...', discardStdin: false }).start();
                rimraf.sync(runtimePath);
                const settings = getSettings();
                if (runtime === settings.defaultRuntime) {
                    delete settings.defaultRuntime;
                    await saveSettings(settings);
                }
                spinner.stop();
            }
        }
    } catch (error) {
        console.error(error);
        process.exit(-1);
    }

};
