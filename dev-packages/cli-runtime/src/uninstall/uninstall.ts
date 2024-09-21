
import { PathUtil } from '@celljs/cli-common/lib/utils/path-util';
import { SettingsUtil } from '@celljs/cli-common/lib/settings/settings-util';

const rimraf = require('rimraf');
import { existsSync } from 'fs-extra';
import { RuntimeUtil } from '../util/runtime-util';
import { prompts } from 'prompts';
const chalk = require('chalk');
import * as ora from 'ora';

export interface UninstallOptions {
    runtime?: string;
}

export async function selectRuntime(): Promise<string> {
    const runtimes = await RuntimeUtil.getInstalledRuntimes();
    const choices = runtimes.map(r => ({ title: chalk`${r.name} {italic.gray runtime}`, value: r }));
    const answer = await prompts.autocomplete({
        name: 'runtime',
        type: 'autocomplete',
        limit: 12,
        message: 'Select a runtime to uninstall',
        choices,
        suggest: async input => choices.filter(item => !input || item.title.toLowerCase().includes(input.toLowerCase()))
    });
    return answer.name;
}

export default async (options: UninstallOptions) => {
    try {
        let runtime = options.runtime;
        if (!runtime) {
            runtime = await selectRuntime();
        }
        if (runtime) {
            const runtimePath = PathUtil.getRuntimePath(runtime);
            if (existsSync(runtimePath)) {
                const spinner = ora({ text: 'Uninstalling...', discardStdin: false }).start();
                rimraf.sync(runtimePath);
                const settings = SettingsUtil.getSettings();
                if (runtime === settings.defaultRuntime) {
                    SettingsUtil.updateSettings({ defaultRuntime: undefined });
                }
                spinner.stop();
            }
        }
    } catch (error) {
        console.error(error);
        process.exit(-1);
    }

};
