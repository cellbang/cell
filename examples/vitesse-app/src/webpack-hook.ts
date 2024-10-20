import { ConfigurationContext, WebpackContext } from '@celljs/cli-service'
import AutoImport from 'unplugin-auto-import/webpack'
import VueRouter from 'unplugin-vue-router/webpack'
import Components from 'unplugin-vue-components/webpack'
import Markdown from 'unplugin-vue-markdown/webpack'
import type { Options as MarkdownOptions } from 'unplugin-vue-markdown/types'
import LinkAttributes from 'markdown-it-link-attributes'
import Shiki from '@shikijs/markdown-it'
import { VueRouterAutoImports } from 'unplugin-vue-router'

// @ts-ignore 这里的类型定义有问题 unocss使用的是export = UnocssWebpackPlugin，所以直接expect-error
import UnoCSS from 'unocss/webpack'

export default async (ctx: WebpackContext) => {
    const frontendConfiguration = ConfigurationContext.getFrontendConfiguration(ctx.configurations)

    // 让vue去处理md文件
    const vueLoader = frontendConfiguration?.module.rules.get('vue')
    vueLoader?.test([/\.vue$/, /\.md$/])
    // 删除掉原来的vue配置
    frontendConfiguration?.module.rules.delete('vue')
    frontendConfiguration?.plugin('unplugin-vue-markdown').use(
        Markdown({
            wrapperClasses: 'prose prose-sm m-auto text-left',
            headEnabled: true,
            async markdownItSetup(md) {
              md.use(LinkAttributes, {
                matcher: (link: string) => /^https?:\/\//.test(link),
                attrs: {
                  target: '_blank',
                  rel: 'noopener',
                },
              })
              md.use(await Shiki({
                defaultColor: false,
                themes: {
                  light: 'vitesse-light',
                  dark: 'vitesse-dark',
                },
              }))
            },
        } as MarkdownOptions)
    )
    // 重新设置vue配置
    frontendConfiguration?.module.rules.set('vue', vueLoader!)
    
    frontendConfiguration?.plugin('unplugin-auto-import').use(
        AutoImport({
            imports: [
                'vue',
                VueRouterAutoImports
            ],
            dts: 'src/browser/auto-imports.d.ts'
        })
    )

    frontendConfiguration?.plugin('unplugin-vue-router').use(
        VueRouter({
            dts: 'src/browser/vue-router.d.ts',
            routesFolder: 'src/browser/pages',
            extensions: ['.vue', '.md'],
        })
    )

    frontendConfiguration?.plugin('unocss').use(
        UnoCSS()
    )
    
    frontendConfiguration?.plugin('unplugin-vue-components').use(
        Components({
            dts: 'src/browser/components.d.ts',
            extensions: ['vue', 'md'],
            dirs: [
                'src/browser/components',
            ]
        })
    )
}
