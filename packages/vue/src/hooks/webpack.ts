import { WebpackContext, ConfigurationContext } from '@malagu/cli-service';

export default async (context: WebpackContext) => {
    const { configurations } = context;
    const config = ConfigurationContext.getFrontendConfiguration(configurations);
    if (config) {
        const { VueLoaderPlugin } = require('vue-loader');

        config
            .module
                .rule('vue')
                    .test(/\.vue$/)
                    .use('vue-loader')
                        .loader('vue-loader')
                    .end()
                .end()
                .rule('css')
                    .test(/\.css$/)
                    .use('vue-style-loader')
                        .loader('vue-style-loader')
                    .end()
                    .use('css-loader')
                        .loader('css-loader');
        config
            .plugin('vueLoader')
                .use(VueLoaderPlugin);
    }
};
