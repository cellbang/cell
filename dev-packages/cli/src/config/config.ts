
import { CliContext, ContextUtils } from '@malagu/cli-common/lib/context/context-protocol';
import { HookExecutor } from '@malagu/cli-common/lib/hook/hook-executor';
import { SettingsUtil } from '@malagu/cli-common/lib/settings/settings-util';

import { dump } from 'js-yaml';

export interface ConfigOptions {
    frameworksUrl?: string;
    frameworksUpstreamUrl?: boolean;
    configFileAlias?: string;
    defaultMode?: string[];
    defaultRuntime?: string[];
    show?: boolean;
}

export default async (cliContext: CliContext, options: ConfigOptions) => {
    try {
        cliContext.options = options;
        const ctx = await ContextUtils.createConfigContext(cliContext);
        if (options.defaultMode?.length) {
            SettingsUtil.updateSettings({
                defaultMode: options.defaultMode
            });
        }
        if (options.defaultRuntime) {
            SettingsUtil.updateSettings({
                defaultRuntime: options.defaultRuntime
            });
        }
        if (options.frameworksUpstreamUrl || options.frameworksUrl) {
            SettingsUtil.updateSettings({
                frameworks: {
                    url: options.frameworksUrl,
                    upstreamUrl: options.frameworksUpstreamUrl
                }
            });
        }
        if (options.configFileAlias) {
            SettingsUtil.updateSettings({
                configFileAlias: options.configFileAlias
            });
        }
        if (options.show) {
            cliContext.output.settings = SettingsUtil.getSettings();
        }
        const hookExecutor = new HookExecutor();
        await hookExecutor.executeConfigHooks(ctx);
        if (options.show) {
            console.log(dump(cliContext.output));
        }
    } catch (error) {
        console.error(error);
        process.exit(-1);
    }
};
