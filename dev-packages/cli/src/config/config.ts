
import { CliContext, HookExecutor, ContextUtils, SettingsUtil } from '@malagu/cli-common';
import { readFileSync, existsSync } from 'fs-extra';

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
        if (options.frameworksUpstreamUrl || options.frameworksUrl || options.configFileAlias) {
            SettingsUtil.updateSettings({
                frameworks: {
                    url: options.frameworksUrl,
                    upstreamUrl: options.frameworksUpstreamUrl,
                    configFileAlias: options.configFileAlias
                }
            });
        }
        if (options.show) {
            const settingsPath = SettingsUtil.getSettingsPath();
            if (existsSync(settingsPath)) {
                console.log(readFileSync(settingsPath, { encoding: 'utf8' }));
            }
        }
        const hookExecutor = new HookExecutor();
        await hookExecutor.executeConfigHooks(ctx);
    } catch (error) {
        console.error(error);
        process.exit(-1);
    }
};
