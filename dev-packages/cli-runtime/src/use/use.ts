
import { SettingsUtil } from '@malagu/cli-common/lib/settings/settings-util';
import { prompts } from 'prompts';
const chalk = require('chalk');
import { ok } from 'assert';
import { Runtimes } from '../runtime-protocol';
import { RuntimeUtil } from '../util/runtime-util';

export interface UseOptions {
    runtime?: string;
}

export async function selectRuntime(): Promise<string> {
    const runtimes = await RuntimeUtil.getInstalledRuntimes();
    const choices = runtimes.map(r => ({ title: chalk`${r.name} {italic.gray runtime}`, value: r }));
    const answer = await prompts.autocomplete({
        name: 'runtime',
        type: 'autocomplete',
        limit: 12,
        message: 'Select a runtime to use (as default)',
        choices,
        suggest: async input => choices.filter(item => !input || item.title.toLowerCase().includes(input.toLowerCase()))
    });
    return answer.name;
}

export default async (options: UseOptions) => {
    try {
        let runtime = options.runtime;
        if (!runtime) {
            runtime = await selectRuntime();
        } else {
            const runtimes = await RuntimeUtil.getInstalledRuntimes();
            let existed = false;
            for (const r of runtimes) {
                if (r.name === runtime) {
                    existed = true;
                }
            }
            ok(existed, `"${runtime}" runtime not found`);
        }
        if (runtime) {
            if (runtime === Runtimes.empty) {
                SettingsUtil.resetSettings({ defaultRuntime: undefined });
            } else {
                SettingsUtil.updateSettings({ defaultRuntime: runtime });
            }
        }
    } catch (error) {
        console.error(error);
        process.exit(-1);
    }

};
