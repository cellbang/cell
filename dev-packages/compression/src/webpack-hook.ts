import { WebpackContext, ConfigurationContext } from '@celljs/cli-service/lib/context/context-protocol';
import { FRONTEND_TARGET } from '@celljs/cli-common/lib/constants';
import { ConfigUtil } from '@celljs/cli-common/lib/utils/config-util';

export default async (context: WebpackContext) => {
    const { configurations, dev, cfg } = context;
    const configuration = ConfigurationContext.getConfiguration(FRONTEND_TARGET, configurations);
    if (configuration) {
        const pluginConfig = ConfigUtil.getWebpackConfig(cfg, FRONTEND_TARGET).compressionWebpackPlugin;
        if (!pluginConfig.disable && !dev) {
            delete pluginConfig.disable;
            const CompressionPlugin = require('compression-webpack-plugin');
            configuration
                .plugin('compression')
                .use(CompressionPlugin, [{
                    threshold: 0,
                    minRatio: 1.2,
                    filename: '[file]',
                    deleteOriginalAssets: true,
                    ...pluginConfig
                }]);
        }
    }

};
