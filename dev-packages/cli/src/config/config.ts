
import { CliContext, HookExecutor, ContextUtils, SettingsUtil } from '@malagu/cli-common';
import { dump } from 'js-yaml';

export interface ConfigOptions {
    frameworksUrl?: string;
    frameworksUpstreamUrl?: boolean;
    configFileAlias?: string;
    show?: boolean;
}

export default async (cliContext: CliContext, options: ConfigOptions) => {
    try {
        cliContext.options = options;
        const ctx = await ContextUtils.createConfigContext(cliContext);
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
