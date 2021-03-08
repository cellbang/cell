import { WebpackContext, FRONTEND_TARGET, ConfigurationContext } from '@malagu/cli';

export default async (context: WebpackContext) => {
    const { configurations } = context;
    const config = ConfigurationContext.getConfiguration(FRONTEND_TARGET, configurations);
    if (config) {
        const { VueLoaderPlugin } = require('vue-loader');

        config.module!.rules.push({
            test: /\.vue$/,
            loader: 'vue-loader'
        });
        config.module!.rules.push({
            test: /\.css$/,
            use: [
              'vue-style-loader',
              'css-loader'
            ]
        });
        config.plugins!.push(new VueLoaderPlugin());
    }
};
