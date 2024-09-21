import { WebpackContext, ConfigurationContext} from '@celljs/cli-service/lib/context/context-protocol';
import { ConfigUtil } from '@celljs/cli-common/lib/utils/config-util';

export default async (context: WebpackContext) => {
    const { dev, cfg, configurations } = context;
    const config = ConfigurationContext.getFrontendConfiguration(configurations);
    if (config) {
        const pluginConfig = ConfigUtil.getFrontendWebpackConfig(cfg).workboxWebpackPlugin || {};
        if (!dev || pluginConfig.generateInDevMode) {
            const WorkboxWebpackPlugin = require('workbox-webpack-plugin');
            delete pluginConfig.generateInDevMode;
            config
                .plugin('workbox')
                .use(WorkboxWebpackPlugin.GenerateSW, [{
                    clientsClaim: true,
                    skipWaiting: true,
                    maximumFileSizeToCacheInBytes: dev ? 10 * 1024 * 1024 : undefined,
                    ...pluginConfig
                }]);
        }
    }
};
