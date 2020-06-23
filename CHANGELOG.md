# Change Log

## v0.0.24

- feat(cli) add admin-app application template
- feat(cli) deployment command no longer checks mode when skipping build
- feat(cli) supports automatic identification of favicon.ico in the root directory of the project
- feat(cli) supports generating resource manifest.json to facilitate access to the micro front-end system
- feat(cli) front-end application supports SPA
- feat(serve-static) optimizes the static resource caching strategy, js, css, pictures and other resources are permanently cached by default, and the HTML file is cached for 5 seconds
- fix(cli) Fix the sourcemap file contains the local path information of the packaged user
- fix(cli) Fix the problem of infinite loop when loading configuration file based on mode
- fix(fc-adapter) Fix the version/alias of the custom domain name binding does not follow the deployment environment

- feat(cli) 添加 admin-app 应用模板
- feat(cli) 部署命令跳过构建时不再检查 mode
- feat(cli) 支持自动识别在项目根目录下的 favicon.ico
- feat(cli) 支持生成资源 manifest.json，方便接入微前端体系
- feat(cli) 前端应用支持 SPA
- feat(serve-static) 优化静态资源缓存策略，js、css 和图片等资源默认永久缓存，html 文件缓存 5 秒
- fix(cli) 修复  sourcemap 文件中包含打包用户的本地路径信息
- fix(cli) 修复基于 mode 加载配置文件出现死循环问题
- fix(fc-adapter) 修复自定义域名绑定的版本/别名没有跟着部署环境走

## v0.0.23

- feat(scf-adapter) Add scf-adapter component
- feat(cli) Optimize multi-environment design
- feat(fc-adapter) The non-custom function of fc-adapter uses fc-express proxy forwarding
- feat(cli) Add scf related templates
- feat(vercel-adapter) Alter zeit-adapter to vercel-adapter

## v0.0.22

- feat(fc-adpater) Optimized the default value of malagu.server.endpoint
- feat(cli) The sample-app template adds serve-static dependencies
- feat(fc-adpater) Optimized configHooks logic

## v0.0.21

- fix(fc-adapter) Fix malagu.server.path default value
- fix(fc-adapter) Delete function initialization function entry
- fix(fc-adapter) Fix function handler path

## v0.0.20

- Modify build command options --skipBuild to --skip-build
- The configuration file supports runtime expression definition: ${{xxx}}
- Resources support multi-regional deployment

## v0.0.19

- feat(fc-adapter) support custom runtime
- feat(serve-static) add component serve-static
- feat(cli) support config hook
- feat(fc-adapter) support custom domain
- feat(cli) deploy command supports skip build process option