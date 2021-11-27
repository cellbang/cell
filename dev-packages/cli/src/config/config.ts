
import { CliContext, HookExecutor, ContextUtils, SettingsUtil } from '@malagu/cli-common';

export interface ConfigOptions {
    frameworksUrl?: string;
    frameworksUpstreamUrl?: boolean;
}

export default async (cliContext: CliContext, options: ConfigOptions) => {
    try {
        cliContext.options = options;
        const ctx = await ContextUtils.createConfigContext(cliContext);
        if (options.frameworksUpstreamUrl || options.frameworksUrl) {SettingsUtil.updateSettings({
            frameworks: {
                url: options.frameworksUrl,
                upstreamUrl: options.frameworksUpstreamUrl
            }
        }); }
        const hookExecutor = new HookExecutor();
        await hookExecutor.executeConfigHooks(ctx);
    } catch (error) {
        console.error(error);
        process.exit(-1);
    }
};
