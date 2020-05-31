import { WebpackContext, ConfigurationContext, BACKEND_TARGET } from '@malagu/cli';

export default async (context: WebpackContext) => {
    const { configurations, dev } = context;

    if (dev !== true) {
        const c = ConfigurationContext.getConfiguration(BACKEND_TARGET, configurations);
        if (c) {
            c.devtool = 'inline-source-map';
        }
    }
};
