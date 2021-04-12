import { WebpackContext, ConfigurationContext } from '@malagu/cli-service';
import { getFrontendMalaguConfig } from '@malagu/cli-common';

export default async (context: WebpackContext) => {
    const { configurations } = context;
    const webpackConfig = ConfigurationContext.getFrontendConfiguration(
        configurations
    );
    if (webpackConfig) {
        const isProd = process.env.NODE_ENV === 'production';
        const shadowMode = false;
        const needInlineMinification = isProd;
        const { webpack } = getFrontendMalaguConfig(context.cfg);
        const sourceMap = !!webpack.devtool;
        const defaultLoaderOptions = {
            css: {},
            scss: {},
            sass: {},
            less: {},
            stylus: {},
            postcss: {},
        };
        const loaderOptions = webpack.css || defaultLoaderOptions;
        if (Object.keys(loaderOptions.postcss).length === 0) {
            loaderOptions.postcss = {
                postcssOptions: {
                    plugins: [require('autoprefixer')],
                },
            };
        }
        const cssnanoOptions = {
            preset: [
                'default',
                {
                    mergeLonghand: false,
                    cssDeclarationSorter: false,
                },
            ],
        };
        if (sourceMap) {
            (cssnanoOptions as any).map = { inline: false };
        }

        // @ts-ignore
        function createCSSRule(
            lang: string,
            test: RegExp,
            loader?: string,
            options = {}
        ) {
            const baseRule = webpackConfig!.module.rule(lang).test(test);

            // rules for <style module>
            const vueModulesRule = baseRule
                .oneOf('vue-modules')
                .resourceQuery(/module/);
            applyLoaders(vueModulesRule, true);

            // rules for <style>
            const vueNormalRule = baseRule.oneOf('vue').resourceQuery(/\?vue/);
            applyLoaders(vueNormalRule);

            // rules for *.module.* files
            const extModulesRule = baseRule
                .oneOf('normal-modules')
                .test(/\.module\.\w+$/);
            applyLoaders(extModulesRule, true);

            // rules for normal CSS imports
            const normalRule = baseRule.oneOf('normal');
            applyLoaders(normalRule);

            function applyLoaders(rule: any, forceCssModule = false) {
                rule.use('vue-style-loader')
                    .loader(require.resolve('vue-style-loader'))
                    .options({
                        sourceMap,
                        shadowMode,
                    });

                const cssLoaderOptions = Object.assign(
                    {
                        sourceMap,
                        importLoaders:
                            1 + // stylePostLoader injected by vue-loader
                            1 + // postcss-loader
                            (needInlineMinification ? 1 : 0),
                    },
                    loaderOptions.css
                );

                if (forceCssModule) {
                    cssLoaderOptions.modules = {
                        ...cssLoaderOptions.modules,
                        auto: true,
                    };
                }

                if (cssLoaderOptions.modules) {
                    cssLoaderOptions.modules = {
                        localIdentName: '[name]_[local]_[hash:base64:5]',
                        ...cssLoaderOptions.modules,
                    };
                }

                rule.use('css-loader')
                    .loader(require.resolve('css-loader'))
                    .options(cssLoaderOptions);

                if (needInlineMinification) {
                    rule.use('cssnano')
                        .loader(require.resolve('postcss-loader'))
                        .options({
                            sourceMap,
                            postcssOptions: {
                                plugins: [require('cssnano')(cssnanoOptions)],
                            },
                        });
                }

                rule.use('postcss-loader')
                    .loader(require.resolve('postcss-loader'))
                    .options(
                        Object.assign({ sourceMap }, loaderOptions.postcss)
                    );

                if (loader) {
                    let resolvedLoader;
                    try {
                        resolvedLoader = require.resolve(loader);
                    } catch (error) {
                        resolvedLoader = loader;
                    }

                    rule.use(loader)
                        .loader(resolvedLoader)
                        .options(Object.assign({ sourceMap }, options));
                }
            }
        }

        webpackConfig!.module.noParse(
            /^(vue|vue-router|vuex|vuex-router-sync)$/
        );

        webpackConfig!.module
            .rule('vue')
            .test(/\.vue$/)
            .use('cache-loader')
            .loader(require.resolve('cache-loader'))
            .options({})
            .end()
            .use('vue-loader')
            .loader(require.resolve('vue-loader'))
            .options({})
            .end()
            .end();

        createCSSRule('css', /\.css$/);
        createCSSRule('postcss', /\.p(ost)?css$/);
        createCSSRule(
            'scss',
            /\.scss$/,
            'sass-loader',
            Object.assign({}, loaderOptions.scss || loaderOptions.sass)
        );
        createCSSRule(
            'sass',
            /\.sass$/,
            'sass-loader',
            Object.assign({}, loaderOptions.scss || loaderOptions.sass)
        );
        createCSSRule('less', /\.less$/, 'less-loader', loaderOptions.less);
        createCSSRule(
            'stylus',
            /\.styl(us)?$/,
            'stylus-loader',
            loaderOptions.stylus
        );

        webpackConfig.plugin('vue-loader').use(require('vue-loader').VueLoaderPlugin);
    }
};
