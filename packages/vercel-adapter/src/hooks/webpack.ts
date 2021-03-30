import { WebpackContext, ConfigurationContext } from '@malagu/cli-service';

export default async (context: WebpackContext) => {
    const { configurations, dev } = context;

    if (dev !== true) {
        const c = ConfigurationContext.getBackendConfiguration(configurations);
        if (c) {
            c.devtool('inline-source-map');
        }
    }
};
