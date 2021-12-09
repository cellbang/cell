import * as fs from 'fs';
import * as path from 'path';
import { WebpackContext, ConfigurationContext, ConfigUtil } from '@malagu/cli-service';

interface LoaderOptions {
    css: any,
    scss: any,
    sass: any,
    less: any,
    stylus: any,
    postcss: any,
}

const findExisting = (context: string, files: string[]) => {
    for (const file of files) {
        if (fs.existsSync(path.join(context, file))) {
            return file;
        }
    }
};

function createVueRule(webpackConfig: any, cacheLoaderConfig: any, vueLoaderConfig: any) {
    webpackConfig.module.noParse(/^(vue|vue-router|vuex|vuex-router-sync)$/);

    webpackConfig.resolve
        .alias
            .set(
                'vue$',
                'vue/dist/vue.runtime.esm-bundler.js'
            );

    webpackConfig.module
        .rule('vue')
            .test(/\.vue$/)
            .use('cache-loader')
                .loader(require.resolve('cache-loader'))
                .options(cacheLoaderConfig)
                .end()
            .use('vue-loader')
                .loader(require.resolve('vue-loader'))
                .options(vueLoaderConfig);

    webpackConfig.module
        .rule('ts')
            .test(/\.ts$/)
            .end()
        .rule('tsx')
            .test(/\.tsx$/)
            .use('babel-loader')
                .loader('babel-loader')
                .options({
                    plugins: ['@babel/plugin-transform-modules-commonjs', '@vue/babel-plugin-jsx']
                }).end()
            .use('ts-loader')
                .loader('ts-loader')
                .options({
                    experimentalWatchApi: true,
                    transpileOnly: true,
                    appendTsxSuffixTo: ['\.vue$']
                }).after('babel-loader');

    webpackConfig.plugin('vue-loader')
        .use(require('vue-loader').VueLoaderPlugin);
}

export default async (context: WebpackContext) => {
    const { configurations, cfg, pkg, dev } = context;
    const webpackConfig = ConfigurationContext.getFrontendConfiguration(
        configurations
    );
    if (webpackConfig) {
        const appRootDir = pkg.projectPath;
        const shadowMode = false;
        const rootVueOptions = ConfigUtil.getFrontendMalaguConfig(cfg)?.vue ?? {};
        const rootcacheLoaderConfig = rootVueOptions.cacheLoader ?? {};
        const rootvueLoaderConfig = rootVueOptions.vueLoader ?? {};
        let cacheLoaderConfig = {};
        let vueLoaderConfig = {};
        if (Array.isArray(rootcacheLoaderConfig)) {
            rootcacheLoaderConfig.forEach(item => {
                cacheLoaderConfig = { ...cacheLoaderConfig, ...item };
              });
        }
        if (Array.isArray(rootvueLoaderConfig)) {
            rootvueLoaderConfig.forEach(item => {
                vueLoaderConfig = { ...vueLoaderConfig, ...item };
              });
        }
        const defaultSassLoaderOptions = {
            implementation: require('sass')
        };
        const css = rootVueOptions.css || {};
        const { extract = !dev, sourceMap = false, loaderOptions = {} as LoaderOptions } = css;

        let { requireModuleExtension } = css;
        if (typeof requireModuleExtension === 'undefined') {
            if (loaderOptions.css && loaderOptions.css.modules) {
                throw new Error(
                    '`css.requireModuleExtension` is required when custom css modules options provided'
                );
            }
            requireModuleExtension = true;
        }

        const { filenameHashing = true, productionSourceMap = true } = rootVueOptions;
        const shouldExtract = extract !== false && !shadowMode;
        const filename = `css/[name]${filenameHashing ? '.[contenthash:8]' : ''}.css`;
        const cssPublicPath = './';

        const extractOptions = Object.assign(
            {
                filename,
                chunkFilename: filename,
            },
            extract && typeof extract === 'object' ? extract : {}
        );

        const hasPostCSSConfig = !!(
            loaderOptions.postcss ||
            findExisting(appRootDir, [
                '.postcssrc',
                '.postcssrc.js',
                'postcss.config.js',
                '.postcssrc.yaml',
                '.postcssrc.json',
            ])
        );

        if (!hasPostCSSConfig) {
            loaderOptions.postcss = {
                postcssOptions: {
                    plugins: [require('autoprefixer')],
                }
            };
        }

        // if building for production but not extracting CSS, we need to minimize
        // the embbeded inline CSS as they will not be going through the optimizing
        // plugin.
        const needInlineMinification = !dev && !shouldExtract;

        const cssnanoOptions = {
            preset: [
                'default',
                {
                    mergeLonghand: false,
                    cssDeclarationSorter: false,
                },
            ],
        };
        if (productionSourceMap && sourceMap) {
            // @ts-ignore
            cssnanoOptions.map = { inline: false };
        }

        // @ts-ignore
        function createCSSRule(lang: string,
                               test: RegExp,
                               loader?: string,
                               options = {}) {
            const baseRule = webpackConfig!.module.rule(lang).test(test);

            // rules for <style lang="module">
            const vueModulesRule = baseRule
                .oneOf('vue-modules')
                .resourceQuery(/module/);
            applyLoaders(vueModulesRule, true);

            // rules for <style>
            const vueNormalRule = baseRule.oneOf('vue').resourceQuery(/\?vue/);
            applyLoaders(vueNormalRule, false);

            // rules for *.module.* files
            const extModulesRule = baseRule
                .oneOf('normal-modules')
                .test(/\.module\.\w+$/);
            applyLoaders(extModulesRule, true);

            // rules for normal CSS imports
            const normalRule = baseRule.oneOf('normal');
            applyLoaders(normalRule, !requireModuleExtension);

            function applyLoaders(rule: any, isCssModule: boolean) {
                if (shouldExtract) {
                    rule.use('extract-css-loader')
                        .loader(require('mini-css-extract-plugin').loader)
                        .options({
                            publicPath: cssPublicPath,
                        });
                } else {
                    rule.use('vue-style-loader')
                        .loader(require.resolve('vue-style-loader'))
                        .options({
                            sourceMap,
                            shadowMode,
                        });
                }

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

                if (isCssModule) {
                    cssLoaderOptions.modules = {
                        localIdentName: '[name]_[local]_[hash:base64:5]',
                        ...cssLoaderOptions.modules,
                    };
                } else {
                    delete cssLoaderOptions.modules;
                }

                rule.use('css-loader')
                    .loader(require.resolve('css-loader'))
                    .options(cssLoaderOptions);

                if (needInlineMinification) {
                    rule.use('cssnano')
                        .loader(require.resolve('postcss-loader'))
                        .options({
                            sourceMap,
                            plugins: [require('cssnano')(cssnanoOptions)],
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

        createVueRule(webpackConfig, cacheLoaderConfig, vueLoaderConfig);

        createCSSRule('css', /\.css$/);
        createCSSRule('postcss', /\.p(ost)?css$/);
        createCSSRule(
            'scss',
            /\.scss$/,
            'sass-loader',
            Object.assign(
                {},
                defaultSassLoaderOptions,
                loaderOptions.scss || loaderOptions.sass
            )
        );
        createCSSRule(
            'sass',
            /\.sass$/,
            'sass-loader',
            Object.assign(
                {},
                defaultSassLoaderOptions,
                loaderOptions.sass,
                {
                    sassOptions: Object.assign(
                        {},
                        loaderOptions.sass &&
                        loaderOptions.sass.sassOptions,
                        {
                            indentedSyntax: true,
                        }
                    ),
                }
            )
        );
        createCSSRule('less', /\.less$/, 'less-loader', loaderOptions.less);
        createCSSRule(
            'stylus',
            /\.styl(us)?$/,
            'stylus-loader',
            Object.assign(
                {
                    preferPathResolver: 'webpack',
                },
                loaderOptions.stylus
            )
        );

        // inject CSS extraction plugin
        if (shouldExtract) {
            webpackConfig
                .plugin('extract-css')
                .use(require('mini-css-extract-plugin'), [extractOptions]);

            // minify extracted CSS
            webpackConfig
                    .optimization
                        .minimizer('optimize-css')
                            .use(require('css-minimizer-webpack-plugin'));

            webpackConfig.module
                .rule('img')
                    .merge({
                        generator: {
                            publicPath: '../',
                        }
                    }).end()
                .rule('svg')
                    .merge({
                        generator: {
                            publicPath: '../',
                        }
                    }).end()
                .rule('font')
                    .merge({
                        generator: {
                            publicPath: '../',
                        }
                    }).end();
        }
    }
};
