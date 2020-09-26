import { WebpackContext, FRONTEND_TARGET, getWebpackConfig, ConfigurationContext } from '@malagu/cli';

export default async (context: WebpackContext) => {
    const { dev, cfg, configurations } = context;
    const config = ConfigurationContext.getConfiguration(FRONTEND_TARGET, configurations);
    if (config) {
        const pluginConfig = getWebpackConfig(cfg, FRONTEND_TARGET).workboxWebpackPlugin || {};
        if (!dev || pluginConfig.generateInDevMode) {
            const WorkboxWebpackPlugin = require('workbox-webpack-plugin');
            delete pluginConfig.generateInDevMode;
            config.plugins!.push(
                    new WorkboxWebpackPlugin.GenerateSW({
                        clientsClaim: true,
                        skipWaiting: true,
                        maximumFileSizeToCacheInBytes: dev ? 10 * 1024 * 1024 : undefined,
                        ...pluginConfig
                    })
            );
        }
    }
};
