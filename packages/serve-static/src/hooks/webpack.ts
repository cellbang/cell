import { WebpackContext, ConfigurationContext } from '@malagu/cli-service';

export default async (context: WebpackContext) => {
    const { dev, configurations } = context;
    const config = ConfigurationContext.getFrontendConfiguration(configurations);
    if (dev && config) {
        config
            .devServer
            .merge({
                devMiddleware: {
                    writeToDisk: true
                }
            });
    }
};
