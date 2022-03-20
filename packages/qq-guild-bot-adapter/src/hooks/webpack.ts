import { ConfigurationContext, WebpackContext } from '@malagu/cli-service/lib/context/context-protocol';
import { PathUtil } from '@malagu/cli-common/lib/utils/path-util';
import { join, resolve } from 'path';
import { existsSync } from 'fs-extra';

export default async (context: WebpackContext) => {
    const { configurations } = context;
    const config = ConfigurationContext.getBackendConfiguration(
        configurations
    );
    if (config) {
        const botConfigPath = join(process.cwd(), 'bot-config.json');
        if (existsSync(botConfigPath)) {
            const { eventMap } = require(botConfigPath);
            for (const event of Object.keys(eventMap || {})) {
                const entryPath = resolve(process.cwd(), eventMap[event]);
                config.entry(event).add(entryPath);
                config.module.rule(event)
                    .test(path => path === entryPath)
                    .use('qq-event-loader')
                    .loader(require.resolve('./event-loader'))
                    .options({ event });
            }
        }
        const CopyPlugin = require('copy-webpack-plugin');
        const backendProjectDistPath = PathUtil.getBackendProjectDistPath();
        config
            .plugin('copyBotConfig')
            .use(CopyPlugin, [{
                patterns: [
                    {
                        from: botConfigPath,
                        to: resolve(backendProjectDistPath, 'bot-config.json')
                    }
                ]
            }]);
    }
};

