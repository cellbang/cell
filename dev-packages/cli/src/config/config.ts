
import { CliContext } from '@malagu/cli-common/lib/context/context-protocol';
import { HookExecutor, HookStage } from '@malagu/cli-common/lib/hook/hook-executor';
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

export default async (ctx: CliContext, options: ConfigOptions) => {
    try {
        ctx.options = options;
        const hookExecutor = new HookExecutor();
        await hookExecutor.executeConfigHooks(ctx, HookStage.before);
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
            ctx.output.settings = SettingsUtil.getSettings();
        }
        await hookExecutor.executeConfigHooks(ctx);
        if (options.show) {
            console.log(dump(ctx.output));
        }
    } catch (error) {
        console.error(error);
        process.exit(-1);
    }
};
