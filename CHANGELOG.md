# Change

## 3.6.1

- chore: 添加 VSCode 设置文件，配置编辑器格式化和排除项

## 3.6.0

- feat: add CellJS style guide with ESLint and Prettier configurations

## 3.5.14

- chore: 调整编译命令及钩子执行顺序

## 3.5.13

- fix(testing): 修复缺少配置文件问题

## 3.5.12

- fix(testing): 修复容器加载问题

## 3.5.11

- refactor: 优化 IPC 模式判断与 cell-remote.yml 默认模式

## 3.5.10

- fix(cli-service): 修复集成测试阻塞问题

## 3.5.9

- feat: enhance settings and testing utilities with new configurations and functions

## 3.5.8

- feat(cli-service): 新增配置工厂类并优化路径设置

## 3.5.7

- feat(ai-core): implement ELPromptTemplate for enhanced prompt rendering and context handling

## 3.5.6

- feat: add ignoreContextExpression option to expressionHandler in render method

## 3.5.5

- feat(core): enhance getContext method to accept expressionCompilerOptions for improved context handling

## 3.5.4

- feat(ai): add optional abort signal to various request interfaces and implementations

## 3.5.3

- refactor(ai-deepseek): rename DeepSeekPIOptions to DeepSeekAPIOptions for consistency

## 3.5.2

fix: update message protocol and content properties for consistency

## 3.5.1

- feat(ai-deepseek): 添加新组件 `@celljs/ai-deepseek`，支持 DeepSeek 模型及其 API
- feat(ai-core): 添加 `ProxyChatModel` 类，用于代理调用多个 ChatModel 实例

## 3.4.4

- fix(*): 修复依赖问题

## 3.4.3

- fix(cli-common): 修复importx导致的HMR失效问题，关闭缓存 (#225)

## 3.4.2

- fix: 在 spawnSync 调用中添加 shell 选项以提高兼容性

## 3.4.1

- feat(ai-anthropic): 添加新组件 `@celljs/ai-anthropic`，支持 Anthropic 模型及其 API

## 3.3.0

- feat(ai-ollama): 添加新组件 `@celljs/ai-ollama`，支持 Ollama 通用能力

## 3.2.0

- feat(ai-ollama): 添加新组件 `@celljs/ai-ollama`，支持 Ollama 通用能力 - (部分完成)
- feat(core): 升级 inversify 依赖版本 6.1.3
- feat(cli-service): 优化网站默认提供的 favicon.ico 图标
- chore(core): 更新 README 和 CHANGELOG 文件，优化文档格式和内容

## 3.1.1

- feat: 给所有的 package.json 统一添加了依赖`tslib` (#215)
- refactor: 更改 start-dev-server 相关逻辑，将require改成使用 importx-tsup 进行导入 (#214)

## 3.1.0

- chore: 升级并修复 TypeDoc 文档
- feat(core): 添加 Assert 工具类和 MimeType 相关的工具类
- chore: 升级 typescript 等基础构建工具依赖
- fix(web): 修复 web 服务 HMR 不生效问题
- refactor: 将 @celljs/cli-common中使用了`ts-node`的地方，改为使用 importx-tsup 包进行动态 require #211

## 3.0.0

- chore: Malagu 改名为 CellJS

## 2.60.3

- fix(cli-common): 修复组件判别逻辑错误

## 2.60.2

- fix(ui-packages): 修复目录名称拼写错误导致前端相关包没有正常发布

## 2.60.1

- feat(retry): 添加新组件 `@celljs/retry`，支持重试机制
- feat(core): 优化 `@celljs/core` 模块对单元测试的支持 

## 2.58.0

- feat(http): 独立 http 模块
- feat(ai): 支持 AI 相关通用能力（开发中）

## 2.60.3

- chore: 移除 authing 和 qq-guild-bot-adapter 过时组件，并优化了组件目录结构，新增 ui 和 cloud 两个组件分类目录

## 2.55.4

- fix(cli-service): 修复首次启动并访问出现 404 错误问题

## 2.55.3

- fix(cli-service + web): 修复 @PostConstruct 方法在开发方式启动会执行两次问题

## 2.55.2

- fix(cli-service + web): 修复模块热更新报错问题

## 2.55.0

- fix(cli-common) 修复 keywords 为空时，无法正常加载 cell 组件配置文件

## 2.55.0

- feat(cache): 添加 node-cache-manager-redis-yet (uses node_redis) 和 node-cache-manager-ioredis-yet (uses ioredis) 的支持
- feat(cache): 支持数组方式配置多级缓存

## 2.54.4

- fix(cache): 修复 redis 缓存新版依赖不兼容问题

## 2.54.3

- fix(cli-common): 修复 keywords 为空时 Cell 项目 HOME 目录默认值异常
- fix(cache): 修复 redis 缓存新版依赖不兼容问题

## 2.54.2

- fix(fc3-plugin): client endpoint 支持多地域

## 2.54.1

- fix(scf-plugin): 修复函数 URL 显示问题

## 2.54.0

- feat(cli-common): 根据 keywords 中声明的组件名称决定 Cell 项目 HOME 目录，默认为 `.cell`
- feat(cli-common): 组件别名的属性对象默认与 cell 根属性对象进行合并
- feat(scf-plugin): 更新支持的地域列表
- feat(scf-plugin): 支持云函数 URL 特性，使用 `-m http` 模式激活
- feat(scf-plugin): 优化灰度配置属性，并提供一个回滚命令 `cell rollout`

## 2.53.2

- fix(security): 修复权限一些问题

## 2.53.1

- fix(security): 修复 Basic 认证逻辑问题
- feat(typeorm): 支持数据源初始化完成状态

## 2.53.0

- feat(scf-plugin) 云资源支持自定义标签：cell.cloud.function.tags: { key: value }


## 2.52.6

- fix(scf-plugin) 修复 COS 内网域名地址


## 2.52.5

- feat(scf-plugin) 支持设置内网 API：cell.cloud.internal: true

## 2.52.4

- fix(cli-service) 修复 ServeHook after 阶段未执行问题

## 2.52.3

- feat(web) 支持 ServerAware 扩展接口，方便扩展 Web Socket 服务

## 2.52.2

- fix(cache) 修复编译警告问题

## 2.52.1

- fix(cli-common) 修复通过组件 package.json 里面的 keywords 指定组件配置文件前置名称的问题

## 2.52.0

- fix(cache) 修复 cache 组件报异步依赖注入错误问题
- feat(cli-common) 支持通过组件 package.json 里面的 keywords 指定组件配置文件前置名称，例如：`"keywords": ["sample-component"]`，则组件配置文件名称可以为：`sample.yml`，模式配置文件为：`sample-[mode].yml`

## 2.51.3

- feat(scf-plugin) 支持 CELL_APP_ID 环境变量

## 2.51.2

- fix(fc3-plugin) createOrUpdateFunction 增加 timeout 时间

## 2.51.0

- feat(cli-runtime) 支持阿里云 fc 3.0 插件
- feat(fc3-plugin) 支持自定义域名和大代码包上传

## 2.50.1

- feat(cli-common) add node18, node20 and bun runtime (#200)

## 2.50.0

- feat(fc3-plugin) add fc3-plugin (#198)

## 2.49.12

- fix(oauth2-client) 添加 authorizationCodeGrantUri 配置，更新 AuthorizationResponse 判定逻辑

## 2.49.11

- fix(Oauth2-client) 修复 AuthorizationCodeGrantMiddleware 重复消费 OAuth2AuthenticationProvider 的 Code 和 State

## 2.49.10

- fix(cli-service) 修复静态网站部署失败问题
- fix(Oauth2-client) 修复 AuthorizationCodeGrantMiddleware 重复消费 OAuth2AuthenticationProvider 的 Code 和 State


## 2.49.9

- fix(scf-plugin) 修复 scf 插件部署失败问题：PublicNetConfig 赋值不正确

## 2.49.8

- fix(lambda-plugin) 修复 lambda 插件部署失败问题：timeoutInMillis 参数超过最大值

## 2.49.7

- fix(cloud-plugin) 修复 region 设置失败问题

## 2.49.5

- fix(oauth2-core) 修复 tokenResponse 转换错误

## 2.49.4

- fix(cli) 移除 monorepo 中的 nx 依赖，降低对 node 版本的要求

## 2.49.3

- fix(nest) 修复 nestjs 框架部署后，访问报错
- fix(cli) 修复 monorepo 模版安装依赖失败
- feat(oidc-provider) 升级 oidc-provider 第三方库版本 #175

## 2.49.2

- fix(core) 修复在没有请求上下文的时候，日志报错

## 2.49.1

- fix(web) 修复类型错误问题

## 2.49.0

- refactor(core) 重构了部分 Logger 接口，并移除了 loglevel 方式的实现，Logger 日志对象由单例，改为非单例
- refactor(logger) 由基于 pino 实现日志组件改为基于 winston
- build(web) 优化后端 HMR 机制，当修改代码过程中出现编译错误时，不会意外退出服务经常，导致需要频繁手动启动服务

## 2.48.4

- fix(cli-common) 修复命令行 Hook 执行报错问题

## 2.48.3

- feat(core) 优化模块加载的幂等性

## 2.48.2

- fix(cli-common) 修复 cell 命令启动报 ts 错误

## 2.48.1

- perf(*) 升级依赖，并减少依赖项

## 2.48.0

- perf(*) 升级依赖，并减少依赖项

## 2.47.1

- fix(cloud-plugin) 修复当 profile 不存在时的 undefined 报错

## 2.47.0

- feat(configs) 添加 Cell 属性配置文件对应的 JSON Schema 文件：configs/cell.schema.json（目前只包含常用的配置项）

## 2.46.6

- fix(typeorm) 修复数据源销毁逻辑调错方法问题

## 2.46.5

- fix(web) 修复在 HMR 模式重启应用之前没有执行应用 onStop 钩子问题

## 2.46.4

- feat(core) 添加新装饰器 @PreDestroy()，用于简单 IoC 容器对象的销毁动作

## 2.46.3

- feat(cloud-plugin) 提升配置文件 cell.cloud.region 属性优先级，可以覆盖全局配置文件

## 2.46.2

- feat(security) 优化认证成功后重定向逻辑优化：异步请求 X_REQUESTED_WITH 和 cell.security.loginSuccessUrl 值为空则不进行重定向逻辑


## 2.46.0

- feat(rpc-core) 添加新组件 @celljs/rpc-core


## 2.45.2

- feat(scf-plugin) 修复 scf 代码上传 cos 的 bucket 命名规则


## 2.45.1

- feat(cli-common): support pnpm workspace (#184)

## 2.45.0

- fix(vercel-adapter) 修复部署 Vercel 平台失败问题

## 2.44.6

- feat(core): 添加一些异步工具函数


## 2.44.5

- fix(core): 修复命名 autoBind 误删其他 bind 的元信息


## 2.44.4

- feat(core): autoBind 支持 name 参数，方便写单元测试，并提供了一个快捷方法 autoBindTesting



## 2.44.3

- feat(cli-common): pnpm Install support --ignore-workspace (#181)


## 2.44.2

- feat(core) 添加 ContainerFactory 类，方便开发单元测试


## 2.44.1

- fix(cli-common) 修复配置 `packager: pnpm` 属性不生效


## 2.44.0

- feat(core) 添加装饰器 @AutowaredProvider，可以按接口提供一类扩展实现对象，并提供了排序能力，通过这种方式，可以避免循环依赖注入问题，因为又是延迟加载，可以优化启动性能


## 2.43.1

- feat(core) 支持动态配装饰器方法：decorate，例如 `decorate(Unmanaged(), Widget, 0)`

## 2.43.0

- feat(mvc) 支持通过熟悉配置定义 JSON 视图格式，默认通过 json-wrapper 模式启用默认统一格式，默认配置如下：
```yaml
cell: 
  mvc: 
    jsonView:
      errorHandler: 
        enabled: true
        priority: 2000
      template: |
        {
          "message": "{{error}}",
          "success": {{success}},
          "data": {{model}}
        }
```


## 2.42.2

- fix(cli) 修复 monorepo 应用模版 json 格式错误

## 2.42.1

- feat(cli) 支持 monorepo 应用模版，帮助用户快速搭建大型项目脚手架


## 2.42.0

- feat(*) 升级 typescript 版本和更新 eslint 规则


## 2.41.0

- feat(web) 支持 Web 应用健康指标查询，`/health` 查看所有健康指标，`/health/xxx` 查看名称为 xxx 的健康指标，开发者也可以通过 HealthIndicator 接口注册自定义健康指标


## 2.40.13

- fix(cli) 修复在 windows 系统下构建产物运行报找不到 Value 错误
- feat(cli) 支持 docker 构建打包类型的模板：docker


## 2.40.12

- fix(cli) 修复属性文件重复监听导致应用重复多次启动问题


## 2.40.11

- feat(vue) 默认 vue 组件开启前后端一体化特性

## 2.40.10

- feat(*) 优化 targets 默认配置，现在无需显示指定 backend

## 2.40.9

- fix(runtime) 修复 node14 和 node12 配置

## 2.40.8

- fix(cli) 修复 accounts 模板创建不了问题

## 2.40.7

- feat(fc-plugin) 增加 API 网关 SDK 超时时间到 1 分钟

## 2.40.5

- fix(web) 修复控制器方法参数的基础类型转换不正确问题

## 2.40.2

- feat(adonis-plugin) respect tsconfig outDir as distDir
- feat(pnpm) add copyPackageSectionNames (#170)
- feat(fc-plugin): add http trigger url (#171)

## 2.40.1

- feat(examples) add prisma demo

## 2.40.0

- fix(core) 修复类作为 ID 注入报错问题
- feat(core) 升级 inversify 依赖到 6.0.1
- feat(core + web) 重构 Context 机制
- feat(typeorm) 优化数据库事务管理机制
- feat(cli) 优化模版，支持 package.json 文件支持版本占位符 {{ version }}，初始化模板的时候，框架会自动注入当前版本

## 2.39.2

- feat(frameworks) 支持 craco 框架一键部署

## 2.39.1

- feat(scf-plugin) 支持 websocket 模式配置
- feat(scf-plugin) 默认的 python 运行时为 Python3.7
- fix(scf-plugin) 修复权限丢失问题

## 2.39.0

- feat(scf-plugin) 当通过 cell config 指定了主账号账号对应 appId，则使用 cos 方式上传函数代码和层

## 2.38.21

- feat(frameworks) 优化 python 框架检测规则

## 2.38.16

- feat(node-plugin) 支持 layer 模式一键开启把 node_modules 发布到函数层上

## 2.38.8

- feat(*) 优化依赖，解决幽灵依赖问题，更好地支持 pnpm
- feat(node-runtime-plugin) 移除组件 `@celljs/node-runtime-plugin`

## 2.37.8

- fix(python-plugin) 修复模块找不到问题

## 2.37.7

- fix(python-plugin) 修复一些问题

## 2.37.5

- feat(python-plugin) 支持 python 应用部署能力

## 2.36.0

- feat(frameworks) 支持 react-static、vuepress 框架项目一键部署

## 2.35.1

- fix(adonis) 修复构建存在的一些问题

## 2.35.0

- feat(examples) add adonis-app example
- feat(plugin) add adonis-plugin
- feat(framework) add adonisjs support
- fix(oauth2) fix some oauth2.0 bug

## 2.34.0

- fix(oidc-provider + jose) 升级依赖版本
- feat(node-plugin) 支持 entryMode 属性，目前有 bundle 和 module 两种默认，bundle 模式则将 entry 进行 webpack 打包


## 2.33.2

- fix(runtime) 修复 yaml 配置文件格式问题

## 2.33.1

- fix(cli) 修复 yaml-js 模块的精灵依赖问题

## 2.33.0

- feat(cli) 编译期 EL 表达式转换器：`onTarget` 和 `onMode`，例如 `foo: ${ 'bar' | onTarget('backend') }` 表示当作为后端属性时，foo 属性的值才是 `bar`
- fix(core) 修复 aop-protocol.ts 变量命名. (#157)

## 2.32.3

- fix(template) 修复应用模板 `schedule`

## 2.32.2

- fix(web) 修复 `No context available. ns.run() or ns.bind() must be called first`

## 2.32.1

- fix(cli): change packager detect order (#156)

## 2.32.0

- feat(cli): add pnpm Packager
- feat(code-loader-plugin): support zip symlink
- feat(cli): support pnpm when init project
- fix(init): add -p option shutcut

## 2.31.3

- fix(frameworks): change framework detect order (#152)
- fix(cli): update tempate doc

## 2.31.1

- fix(jwt-app) 修复 `jwt-app` 模板的 ErrorHandler 不生效问题

## 2.31.0

- feat(cli) 添加新模板 `jwt-app`
- feat(jwt) 添加新组件 `@celljs/jwt`
- feat(cli) 优化模版 `sample-app`

## 2.30.0

- feat(react) 升级 react 版到 18
- feat(next-plugin) 兼容 Nextjs 项目可能不存在 `public` 目录 

## 2.29.3

- fix(node-plugin) 修复 nextjs 框架部署报错
- feat(cli-service) 支持指定空 entry：`entry: EMPTY`，或者通过模式指定 `-m empty-entry`

## 2.29.2

- feat(runtime) 优化运行时全量安装的体积
## 2.29.1

- feat(next-plugin) 支持 `next.config.mjs` 配置文件
- feat(cli-service) 支持指定空 entry：`entry: EMPTY_ENTRY`，或者通过模式指定 `-m empty-entry`

## 2.29.0

- fix(cache) 修复 CacheManager 对象注入错误问题
- feat(frameworks) 新建框架 blitzjs、gatsby、astro、eleventy、docusaurus-2 一键部署能力

## 2.28.6

- fix(serve-static) 修复部分请求卡住问题

## 2.28.5

- feat(faas) 将函数超时时间提升至 60 秒
- fix(typeorm) 修复 `cell-fc.yml` 文件不存在问题

## 2.28.3

- feat(scf-plugin) 支持 CFS 配置

## 2.28.2

- fix(component) 修复 `cell-component clean` 命令报错
- feat(runtime) 支持 `better-sqlite3` 排除

## 2.28.1

- feat(*) 优化 `.env` 处理策略


## 2.28.0

- feat(testing) 添加新组件 `@celljs/testing`, 方便实现 e2e 测试
- feat(cli) 为 `backend-app` 模板添加集成测试代码示例

## 2.27.0

- feat(elasticsearch) 添加新组件 `@celljs/elasticsearch`

## 2.26.4

- feat(cli-common) 优化组件版本检测机制

## 2.26.3

- fix(lambda-plugin) 修复属性 key 重复报错

## 2.26.2

- feat(cli) 添加模板 `cell-component`，方便开发者快速开发 Cell 组件

## 2.26.1

- fix(fc-plugin|scf-plugin) 修复 cell info 报错

## 2.26.0

- fix(node-runtime-plugin) 修复 node 二进制包解压错误
- feat(typeorm) 升级 typeorm 版本到 0.3.7
- feat(fc-plugin|scf-plugin) 支持层的自动创建
- feat(cli-runtime) 为函数计算提供 nodejs 不同版本的层的创建

## 2.25.1

- fix(*) fix typo: ERROR_HANDlER_PRIORITY to ERROR_HANDLER_PRIORITY

## 2.25.0

- feat(component) 模块 `@celljs/ext-scripts` 改名为 `@celljs/component`

## 2.24.1

- feat(scf-plugin) Web 函数支持单实例多并发，默认最大并发度为 10
- feat(fc-plugin) 支持属性 `withoutCodeLimit`，默认为 true，函数代码体积无限制

## 2.24.0

- feat(config) 新增 @celljs/config 组件，用于提供运行时的配置属性方式。包含以下运行时配置属性策略：通过环境变量 CELL_PROPS_FILE 配置属性文件位置和尝试从 process.cwd() 和 __dirname 目录下加载 cell.yml 和 cell.yaml 配置文件

## 2.23.3

- fix(qq-guild-bot-adapter) 固定 qq-guild-bot 版本，避免错误自动升级

## 2.23.2

- fix(core) 修改 `globalThis` 为 `currentThis`
- feat(oidc-provider) 升级依赖

## 2.23.1

- fix(cli-service) 修复模块替换导致当前目录模块下版本不一致

## 2.23.0

- feat(mvc) 控制器路由支持 `@All` 装饰器
- feat(mvc) 控制器路由支持优先级规则：字符串类型的路由优先级大于正则表达式；精确路由大于模式路由

## 2.22.12

- fix(frameworks) 修复在使用 `projectPath` 属性时，框架无法正确匹配

## 2.22.11

- fix(core) EL 表达式没有正确处理 _ignoreEl 标准，导致表达式解析错误

## 2.22.10

- feat(qq-guild-bot-adapter) 升级 qq-guild-bot 依赖

## 2.22.9

- feat(qq-guild-bot-adapter) 升级 qq-guild-bot 依赖

## 2.22.8

- feat(qq-guild-bot-adapter) 升级 qq-guild-bot 依赖

## 2.22.7

- fix(qq-guild-bot-adapter) 修复第二次事件没有注册成功问题

## 2.22.6

- fix security alerts

## 2.22.4

- fix(qq-guild-bot-adapter) 升级依赖修复 BUG

## 2.22.3

- fix(scf-adapter) 修复事件类型函数入口问题

## 2.22.2

- fix(qq-guild-bot-adapter) 修复遗留的 ws 问题

## 2.22.0

- feat(qq-guild-bot-adapter) 移除 websocket 相关
- feat(node-runtime-plugin) 升级函数计算 Custom Runtime 中 node 版本，从而支持新版 Next.js 项目

## 2.21.2

- feat(qq-guild-bot-adapter) 支持读取 `bot-config.json` 中的 `secret` 属性
- feat(cli) 更新 `mycli` 模板

## 2.21.1

- feat(fc-plugin) 支持 `cell info` 命令打印随机域名
- feat(cloud-plugin) 优化对象存储上传代码，协议如下：`s3://bucket/key?region=xxx&version=1`，其中 key 支持多级路径，region 和 version 可选

## 2.21.0

- fix(core) 兼容 nodejs12 以下的版本
- feat(fc-plugin) 支持自动生成随机域名，方便用户测试与预览
- feat(scf-plugin) 支持函数 EnvId 等更多新属性的配置
- feat(*-plugin) 支持通过对象存储上传代码
- feat(cli) 支持最新版 Next.js 框架

## 2.20.5

- feat(cli-runtime) 默认运行时添加 `@celljs/qq-guild-bot-adapter` 和 `@celljs/next-plugin`

## 2.20.3

- feat(faas-adapter) FaaSEventListener 接口支持返回参数
- feat(qq-guild-bot-adapter) 支持 QQ 机器人更优雅地结束

## 2.20.2

- fix(scf-plugin) 修复定时触发器参数错误

## 2.20.1

- fix(core) global 改为 globalThis 兼容非 nodejs 场景

## 2.20.0

- feat(cli) 添加新模板 `standalone-app`，如何在不适用命令行工具的情况下，集成框架能力
- feat(core) 添加应用工场，方便第三方项目集成框架核心能力
- feat(core) 应用接口 `Application` 添加 `stop` 方法

## 2.19.0

- feat(cli) 支持 `cell --skip-auto-install`：跳过自动按需安装运行时组件过程
- feat(qq-guild-bot) 事件参数名从 data 改为 context
- fix(cli-service) 修复编译报错却没有终止命令行，且输出的成功日志
- feat node-forge version
- feat(cli/cli-common/cli-runtime) update minimist version

## 2.18.4

- feat(qq-guild-bot-adapter) 支持在函数超时前主动结束返回，避免函数超时错误
- feat(*-plugin) 添加新属性 `cell.cloud.function.sync=onlyUpdateCode` 只更新函数代码，而不更新函数配置

## 2.18.3

- fix(cos) 修复腾讯云对象存储接口调用不工作问题

## 2.18.2

- fix(qq-guild-bot-adapter) 修复 bot-config.json 路径不正确

## 2.18.0

- feat(qq-guild-bot-adapter) 添加 QQ 机器人适配器组件


## 2.17.2

- fix(cli-common) 修复 mode 属性计算错误

## 2.17.1

- fix(cli-common) 修复使用 `--props-file` 选项是报 mode 相关的错误

## 2.17.0

- feat(react) react 添加 css 预处理器和 css module 支持
- fix(*-plugin) 优化函数更新时 runtime 冲突 #140
- fix(cli-common) 修复根组件属性多维加载顺序问题

## 2.16.5

- fix(cli-runtime) 修复由于拼写错误导致适配器组件没有被正常加载

## 2.16.4

- fix(cli-service) 修复日志输出错误

## 2.16.3

- fix(puppeteer) 修复 `configurations is not iterable` 错误
- feat(cli-service) 本地开发时，devtool 默认使用 `source-map`，方便调试 

## 2.16.2

- fix(cli-service) 修复webpack插件错误
- feat(ext-scripts) 优化代码

## 2.16.0

- feat(cli) 支持根命令参数 `--props-dir` 和 `--props-file`，用于指定额外的自定义属性文件位置，优先级比项目级别的属性文件高，方便开发者透传属性配置
- fix(cli) 把全局属性配置文件改为全局配置目录，基于环境变量 `GLOBAL_CELL_PROPS_DIR_PATH` 自定义，默认是 `~/.cell`

## 2.15.2

- fix(next-plugin) 修复 `next` 模块找不到错误

## 2.15.1

- feat(cli-*) Hook 机制支持 `after` 阶段
- feat(cli) 添加 `nextjs` 模板
- feat(next-plugin) 适配 `nextjs` 框架的开发部署
- feat(cli) 优化框架适配机制

## 2.14.1

- fix(node-plugin) 修复端口问题冲突和不生效问题

## 2.14.0

- feat(cli-*) Hook 机制支持 `before` 阶段，例如 Build Hook 的 `before` 阶段表示在构建之前执行，只需在 Hook 文件中导出 `before` 方法即可
- fix(node-plugin) 修复 nestjs 应用端口冲突和部署报错问题

## 2.13.6

- feat(cloud-plugin) 新增 sync 属性
- feat(*) 新增编译期 EL 表达式变量 projectDir，用于获取当前项目的绝对路径，例如可以在属性配置文件中写法如下：${projectDir}

## 2.13.5

- fix(cli) 修复 `cell update` 命令不生效

## 2.13.4

- feat(cli-service) 支持 webpack 插件 node-polyfill-webpack-plugin

## 2.13.2

- fix(fc-plugin + scf-plugin) 修复项目 home 目录不存在错误

## 2.13.1

- fix(node-plugin) 修复windows下entry解析错误

## 2.13.0

- feat(cli + cli-common) 支持全局配置文件，默认全局配置文件路径为： `~/.cell/cell.yml`，可以通过环境变量自定义：`GLOBAL_CELL_CONFIG_PATH`
- feat(cli + cli-common) 支持配置属性 `projectPath`，可以在配置文件中指定项目的真正工作目录，该配置项只在命令行的工作目录的配置文件有效

## 2.12.0

- feat(frameworks) 支持纯静态网站部署 `static-site`
- feat(cli + cli-common) 支持命令 `cell update`，一键升级命令行和组件
- feat(cli) 简化命令 `cell init`，移除 `name` 选项，`--output-dir` 选项的行为与 `git clone` 的 `dir` 参数保持一致

## 2.11.6

- fix(cli-service) 修复 .env 无法加载
- feat(cli-common) ts-node 添加 transpileOnly 选项，优化 hooks 加载速度
- feat(*-plugin) 升级 runtime
- fix(typedoc) 修复文档生成死循环

## 2.11.5

- feat(express-adapter) 支持环境变量设置端口：`SERVER_PORT`

## 2.11.3

- fix(cli-service) 修复编译含有错误或警告时,插件报错问题

## 2.11.2

- fix(cli-service) 更新输出插件 修复进度条重复输出

## 2.11.1

- fix(cli-service) 修复 `process/browser` 模块找不到问题
- fix(cli-service) 修复控制台重复输出问题

## 2.11.0

- feat(runtime + frameworks) 去掉默认部署到云函数机制，避免默认下载必要的组件
- fix(vue) 修复图片路径错误
- fix(core) 将Emitter抽取到单独文件，修复esbuild编译时循环引用无法正确取值的问题


## 2.10.2

- feat(cli-service) 默认设置 `allowedHosts` 为 all，确保在云端开发也能正常预览

## 2.10.1

- fix(cli-service+vue) 修复依赖错误

## 2.10.0

- feat(all) support npm8

## 2.9.6

- fix(cli-common) 修复组件属性计算错误（添加深拷贝）

## 2.9.5

- fix(mvc) 修复自定义视图取值错误 (#110)

## 2.9.4

- fix(cli-service) 修复微服务模板依赖路径替换错误 (#107)
- fix(scf-plugin) 修复配置文件缺失 (#105)

## 2.9.2

- fix(fc-plugin) 修复阿里云函数计算api网关后端超时单位错误 (#102)

## 2.9.1

- fix(*-plugin) 修复 api gateway 模式下 disableProjectId 覆盖问题 (#100)

## 2.9.0

- fix(cli-service) 修复 Windows 下运行报错，必须本地依赖 scf-adapter 组件 (#95)
- fix(code-loader-plugin) 优化代码

## 2.8.9

- feat(*-plugin) 支持随机后缀 ID 关闭开关，通过属性控制：`cell.cloud.disableProjectId` (#93)
- feat(cli+cli-runtimes) 支持新命令行选项：`cell runtime install --overwrite`

## 2.8.8

- feat(scf-plugin) 支持腾讯云函数默认网关触发器, 本模式下网关调用次数不再计费 (#90)
- fix(cli) 修复vue模板代码图片不显示的问题 (#91)

## 2.8.7

- fix(cli-runtime) 修复静态网站部署问题


## 2.8.6

- feat(scf-plugin) 优化 `cell info` 执行效率
- fix(scf-plugin) 修复 `cell info` 报函数别名找不到
- feat(examples) 添加认证与授权相关的示例模板

## 2.8.5

- fix(lambda-plugin): 修复 lambda 创建新函数有机率因为新角色未同步导致报错的问题 (#88)
- fix(static-plugin) fix typo
- feat(cli) 支持 `cell config --default-runtime` 选项

## 2.8.4

- fix(frameworks) fix ember compileCommand 
- feat(frameworks + node-plugin): support fastify
- fix(frameworks) 修复 ionic-reac、ionic-angular 框架识别错误的问题 (#87)
- feat(cli-service) 优化部署完成退出规则

## 2.8.3

- feat(frameworks) 支持 hexo、nuxtjs、ionic-angular、sveltekit、ionic-react、umijs 前端框架

## 2.8.2

- fix(cli-service) Fix problems introduced by webpack upgrade (#84)
- fix(cli-runtime) 添加传统服务构建模式 `cell build -m server` 和 vercel 部署模式 `cell deploy -m vercel`
- fix(cli-runtime) 添加新模式 `externals`，该模式内置了需要排除的包，比如 vm2 等等，使用方式：`cell deploy -m externals`

## 2.7.6

- fix(node-plugin) 修复文件不存在错误
- fix(scf-plugin): 修复腾讯云绑定自定义域名报错的问题 (#83)

## 2.7.5

- fix(node-plugin) 修复文件不存在错误

## 2.7.4

- feat(cli) 优化首次命令执行的性能


## 2.7.2

- fix(cli-service) 修复 webpack 无法加载运行时目录下的包

## 2.7.1

- feat(node-plugin) aws lambda 支持 express、koajs 等等
- feat(*-plugin) 移除 `cloud.faas` 中的 faas，并将 faas 子属性提升
- fix(node-plugin) 修复并优化 entry 代码

## 2.6.2

- fix(static-plugin) 修复静态文件没有正常打包
- fix(lambda-plugin) 修复权限设置错误

## 2.6.1

- fix(cli-service) 修复 pick external 报错
- fix(node-plugin): 修复当 server.path 不为空时， 构建产物异常导致项目启动报错的问题 (#82)

## 2.6.0

- feat(*) 支持项目 link 能力，确保不同项目之间不会出现覆盖部署
- feat(cli-service) 移除合并后输出的配置文件，改用 `cell props`
- fix(fc-plugin) 修复其他环境没有部署的情况下仍然可以 info 出信息问题
- fix(cli) fix typo
- fix(cli-runtime) 修复运行时组件顺序问题

## 2.5.11

- fix(framework) 修复 angular 框架构建目录问题
- fix(fc-plugin) 优化日志输出和统一修改时间字段
- fix(cli-common) 修复 `env` 中的表达式没有被计算


## 2.5.10

- feat(cli) 添加 `cell props` 命令，用户显示当前应用完整属性配置信息
- feat(cloud-plugin) 云厂商 profile 文件添加 `stage` 属性表示当前环境，优先级低于应用根组件属性的 `stage`，高于其他
- fix(cli-common) 修复部署报错
- refactor(cli-common) 重构 framework 在属性配置文件中的格式

## 2.5.9

- fix(cli) 修复 frameworks 中的表达式解释与配置文件中不一致问题
- fix(scf-plugin + fc-plugin + lambda-plugin) 修复按环境查询信息不正确

## 2.5.8

- fix(cli) 修复部分项目模块依赖加载不到
- fix(cli-service) 去掉多余日志信息

## 2.5.7

- fix(scf-plugin) 修复 `cell info` 切环境信息不对
- fix(cli-service) 修复 cell 框架在运行时背景下构建问题

## 2.5.6

- feat(frameworks + cli-service) 支持 compileCommand、serveCommand、buildCommand、deployCommand 命令配置
- feat(cli-service) 支持 webpack 属性配置，与 cell.webpack 等效
- feat(cli-service) 支持 includeModules 属性配置，与 cell.includeModules 等效
- feat(cli) 支持 framework 属性配置
- feat(cloud-plugin) 支持 cloud 属性配置，与 cell.webpack 等效


## 2.5.5

- feat(node-plugin) 添加 `serve hook` 插件，支持 HMR
- fix(serve-static) 修复静态文件 root 路径
- feat(cli-common) 提供 `cell config --default-mode` 配置属性，用于配置默认 mode
- feat(cli) 添加 nest-app 和 koa-app 应用模板

## 2.5.4

- feat(framework) 优化 `cell` 框架的默认构建目录
- fix(cli) 优化 `cell init` 命令初始化模板后没有正确安装依赖包
- fix(cli-common) 提供环境变量 `CELL_PROJECT_DIST_PATH` 配置项目构建目录

## 2.5.2

- fix(*) 修复 `cell` 框架运行报错

## 2.5.1

- feat(framework) 适配 `cell` 框架
- feat(cli) 当发现当前目录下存在 `@celljs/cli` 包，优先使用本地的命令
- feat(cli-runtime) 安装运行时的时候，提供 `quiet` 参数用于控制不输出日志信息
- feat(cli-runtime) 分别提供 `cell`、`compression`、`eslint` 模式配置文件，方便开发者一键开启响应功能

## 2.5.0

- fix(cli-service) 修复排除包存在的一些问题
- feat(cli-service) 后端只有在 `prod` 模式下才会压缩混淆
- feat(cli-service) 后端 sourcemap 只有在本地运行才会生成
- fix(cli-runtime) 修复找不到模块警告


## 2.4.4

- feat(cli-common) 提供 `CELL_CONFIG_FILE_ALIAS` 环境变量方式配置，优先级比配置文件高
- feat(cli) 提供 `CELL_BANNER` 环境变量方式配置，优先级比配置文件高
- fix(cloud-plugin) 修复 `profile.credentials.token` 赋值
- fix(*-plugin) 优化日志输出和自定义域名配置


## 2.4.3

- feat(framework): frontend framework deploy support svelte, preact, ember (#77)

## 2.4.2

- feat(cli-common) 支持多版本运行时
- feat(cli-common) 支持运行时组件按需加载
- feat(cli-runtime) 运行时模板渲染优化
- feat(plugins) 日志输出优化 

## 2.2.2

- fix(cli-service) 修复构建时文件目录不存在

## 2.2.1

- feat(cli-common) 支持 info 插件，优化 `cell info` 命令
- feat(lambda-plugin) 添加 info 插件
- feat(cloud-plugin) 支持 `cell config --show-profile` 显示账号配置信息
- feat(cli-common) 美好日志输出，并支持 banner 自定义设置
- fix(cli) 修复`cell config --config-file-alias deploy` 命令不生效问题


## 2.1.2

- feat(cli+cloud-plugin) 支持 `cell config --show` 显示完整配置信息
- feat(cli-common) 组件配置配置文件支持 yml 和 yaml 两种后缀；模式文件也支持两种格式：`cell.[mode].yml` 和 `cell-[mode].yml`
- feat(cli-common) 支持配置文件别名配置 `cell config --config-file-alias deploy`，默认总会加载 cell 别名的配置文件，如 cell.yml，现在可以额外指定其他别名

## 2.1.1

- feat(frameworks) 支持 expressjs、koajs、nestjs 框架部署
- feat(cli-service) 优化构建输出目录结构

- feat(frameworks) supports expressjs, koajs, nestjs framework deployment
- feat(cli-service) optimize the structure of the output directory structure

## 2.0.9

- fix(scf-plugin) fix InvalidParameter.FormatError

## 2.0.8
- feat(node-plugin) add `@celljs/node-plugin` compnent
- feat(scf-plugin) 优化 API 网关路由
- feat(scf-plugin) optimize API gateway routing

## 2.0.4
- fix(web) Upgrade class-transformer to v0.5.1

## 2.0.3
- fix(cli) 修复模板字符串格式错误
- feat(cli-runtime) 优化消息提醒和退出机制

## 2.0.0

- feat(*-adapter) 将构建部署相关逻辑抽象为独立的组件 *-plugin，以方便复用
- feat(code-loader-plugin) 将代码加载打包逻辑抽象为独立组件
- feat(cli-runtime) 添加 `scf` 运行时
- feat(cli) 支持属性文件定义运行时
- feat(parent) 升级 lerna 版本到 4.0.0
- feat(parent) 升级 axios 版本到 0.24.0
- feat(static-plugin) 添加插件 `@celljs/static-plugin`
- feat(frameworks) 添加组件 `@celljs/frameworks`
- feat(static-plugin) 优化代码
- fix(all) fix Dependabot alerts
- feat(cli) 支持智能适配运行时和模式
- feat(cloud-plugin) 支持命令行参数输入账号配置信息 (#72)
- feat(cli + cli-common) 优化模式命令
- feat(cli) 支持 `cell config` 命令

- feat(*-adapter) abstracts the logic of construction and deployment into independent components *-plugin to facilitate reuse
- feat(code-loader-plugin) abstracts code loading and packaging logic into independent components
- feat(cli-runtime) add `scf` runtime
- feat(cli) supports property file definition runtime
- feat(static-plugin) add plugin `@celljs/static-plugin`
- feat(frameworks) add component `@celljs/frameworks`
- feat(static-plugin) optimized code
- fix(all) fix Dependabot alerts
- feat(cli) supports smart adaptation of runtime and mode
- feat(cloud-plugin) supports command line parameters to input account configuration information (#72)
- feat(cli + cli-common) optimization mode command
- feat(cli) Support `cell config` command

## 1.40.1

- fix(cli-common) miss typescript package

## 1.40.0

- feat(cli+cli-common+cli-service) Hook 机制重构，且 cli-service 完全基于 Hook 实现命令行
- feat(cli+cli-common+cli-service) Hook mechanism is refactored, and cli-service is completely based on Hook to implement command line

## 1.39.2
- fix(rpc) 修复 rpc 接口参数为数组的时候解析不正确
- feat(web) 升级 class-transformer 和 class-validator

- fix(rpc) fixes incorrect parsing when the rpc interface parameter is an array
- feat(web) upgrade class-transformer and class-validator

## 1.39.1
- fix(typeorm) 修复多数据错误
- fix(cos) 修复下载对象错误

## 1.39.0
- feat(fc-adapter+scf-adapter) add 'cell info' command for tencent-scf and aliyun-fc

## 1.38.0
- feat(cli) 优化微服务模板 `microservice`

## 1.37.1
- feat(vue) 支持从 yml 中读取 cache-loader 和 vue-loader 的配置 (#62)

## 1.37.0

- feat(cli) Added `accounts` template. The authentication and authorization functions are quickly realized through this template, which comes from real business scenarios.
- feat(cli) 添加 `accounts` 模板。通过该模板快速实现认证与授权功能，该模板来自于真实业务场景。


## 1.36.0

- feat(core) 升级 inversifyjs 版本为 v5.1.1
- feat(core) 修改 core 模块为静态模块，移除 `auto` 属性配置
- feat(core+web) 将 pipe 功能移动到 `@celljs/web` 组件
- feat(core) `ContainerProvider` 提供一个异步获取容器方法：`asyncProvide`
- feat(typeorm) 升级 typeorm 版本为 v0.2.37
- feat(typeorm) 升级 mysql 版本为 v2.18.1

- feat(core) upgrade inversifyjs version to v5.1.1
- feat(core) modify the core module as a static module, remove the `auto` attribute configuration
- feat(core+web) moves the pipe function to the `@celljs/web` component
- feat(core) `ContainerProvider` provides an asynchronous method to obtain the container: `asyncProvide`
- feat(typeorm) upgrade typeorm version to v0.2.37
- feat(mysql) upgrade typeorm version to v2.18.1

## 1.35.2

- fix(cli-service) 修复 `ts-node` 等模块找不到错误

## 1.35.1

- fix(cli-service) 修复静态模块加载错误


## 1.35.0

- feat(cli-service) 优化 sourcemap 生成策略
- feat(all) 将 cell 编译为 ES2017
- feat(cli-service) optimize sourcemap generation strategy
- feat(all) Transpile cell to ES2017


## 1.34.1

- fix(serve-static) Fixes that when using the `@celljs/serve-static` component, the front-end build product is forced to be output to the non-memory file system during the local runtime.
- fix(serve-static) 修复在使用 `@celljs/serve-static` 组件时，本地运行时强制前端构建产物输出到非内存文件系统中。

## 1.34.0


- feat(core) Improve tools
- feat(core) add new decorator `@Unmanaged()`
- feat(security) - feat(security) adds the `JexlEngineProvider` interface to EL Policy to facilitate independent extension of expression functions
- feat(core) 完善工具类
- feat(core) 添加新装饰器 `@Unmanaged()` 
- feat(security) 为 EL Policy 添加 `JexlEngineProvider` 接口，方便独立扩展表达式函数


## 1.33.0

- feat(cli) add `schedule` template

## 1.32.0

- feat(cli-service+web) 升级 `webpack-dev-server` 和 `axois` 
- feat(cli-service+web) upgrade `webpack-dev-server` and `axois` 

## v1.30.3

- fix(cli-service) 去除asset文件名中多余的点(.)
- fix(vue) fix vue webpack hooks indent
- fix(vue) fix error asset relative path in css

## v1.30.2

- fix(scf-adapter): 更新腾讯云 sdk，并修复自定义域名问题 (#51)
- fix(cli-service): 在 package.json 中声明依赖 chalk (#49)

## v1.30.0

- feat(cli-runtime) Support runtime mode: `cell runtime install`
- feat(web) supports the configuration of request body related attributes: `cell.web.body.limit: 5mb`
- feat(cli-runtime) 支持请求体相关属性配置：`cell.web.body.limit: 5mb`
- feat(cli-runtime) 支持运行时模式: `cell runtime install`

## v1.29.0

- feat(cli) upgrade dependency package `commander`
- feat(cli) optimized log output style
- fix(scf-adapter) fixes the problem of attribute configuration

- feat(cli) 升级依赖包 `commander`
- feat(cli) 优化日志输出样式
- fix(scf-adapter) 修复属性配置问题

## v1.28.1

- fix(cli+cli-common) fix windows path compatibility issues
- fix(cli+cli-common) 修复 windows 路径兼容性问题


## v1.28.0

- feat(cli) supports automatically restarting the application after modifying the property file and the code of various plug-ins. (#44)
- feat(cli-service) supports `dotenv` file, the `.env` file under the project root is automatically loaded by default, or you can customize the file path through the property `cell.webpack.dotenvPlugin.path`, the relative path is relative to the project root content. (#46)
- feat(cli-service) supports `Webpack.DefinePlugin` plug-in, which can be configured through the attribute `cell.webpack.definePlugin` (#46)
- feat(cli) optimize log output, magic board and code
- chore: Optimize the build, release and local testing process
- feat(mvc): add `@Req`, `@Res` Decorator (#45)

- feat(cli) 支持修改属性文件、以及各种插件的代码后自动重启应用。(#44)
- feat(cli-service) 支持 `dotenv` 文件，默认自动加载项目根下的 `.env` 文件，也可以通过属性 `cell.webpack.dotenvPlugin.path` 自定义文件路径，相对路径是相对项目根目录。(#46)
- feat(cli-service) 支持 `Webpack.DefinePlugin` 插件，可以通过属性 `cell.webpack.definePlugin` 配置 (#46)
- feat(cli) 优化日志输出、魔板和代码
- chore: 优化构建、发布和本地测试流程
- feat(mvc): 添加 `@Req`, `@Res` 装饰器 (#45)


## v1.27.5

- fix(rpc) Fix RPC call error

## v1.27.4

- fix(rpc) Fix RPC call error

## v1.27.3

- feat(cli-common) 只有存在模式 `local` 的情况下，才会加载应用中的 `devDependencies` 中的组件
- feat(cli-common) When only the mode `local` exists, the components in the `devDependencies` in the application will be loaded

## v1.27.2

- feat(vue) Support Jsx Render (#41)

## v1.27.0

- fix miss yaml file

## v1.26.0

- feat(scf-adapter) Support Web Function 

## v1.25.1
- feat(all) Change to rely on fixed version
- feat(all) 改为依赖固定版本

## v1.25.0

- feat(faas-adapter+fc-adapter) supports mns topic message queue trigger, which is enabled by the mode attribute `mode: [mns-topic] `. The sample configuration is as follows:
```yaml
mode: [ mns-topic ]
cell:
  faas-adapter:
    trigger:
      invocationRole: acs:ram::123456:role/app-mns-role
      sourceARN: acs:mns:cn-hangzhou:123456:/topics/test
      triggerConfig:
        topicName: test
        # filterTag: foo
```
- fix(web) replace `alscontext` with `cls-hooked` package to fix `undefined` error.
- feat(faas-adapter) adds the `FaaSEventListener` interface, which can be used to monitor the event when the function is triggered to execute.

- feat(faas-adapter+fc-adapter) 支持 mns topic 消息队列触发器，通过模式属性 `mode: [ mns-topic ] ` 开启。示例配置如下：
```yaml
mode: [ mns-topic ]
cell:
  faas-adapter:
    trigger:
      invocationRole: acs:ram::123456:role/app-mns-role
      sourceARN: acs:mns:cn-hangzhou:123456:/topics/test
      triggerConfig:
        topicName: test
        # filterTag: foo
```
- fix(web) 使用 `cls-hooked` 包替换 `alscontext`，修复 `undefined` 错误。
- feat(faas-adapter) 添加 `FaaSEventListener` 接口，可用于监听函数被触发执行的事件。

## v1.24.1

- fix(cli) 修复 monorepo 应用模板
- refactor(serve-static) 重构 serve-static 组件(#24)


## v1.24.0

 - feat(faas-adapter+fc-adapter+lambda-dapater+scf-adapter): 适配 Serverless 场景任务调度
 - feat(faas-adapter+fc-adapter+lambda-dapater+scf-adapter): Adapt to serverless scenario task scheduling


## v1.23.4

 - refactor(templates): 显示声明代码内所依赖的包，方便在非扁平式依赖的情况下运行 (#30)

## v1.23.3

- feat(web) 支持环境嗅探式的请求上下文：Async-Hook 和 AsyncLocalStorage。当运行 Nodejs 版本 8.12.0 到 12.17.0 或 13.10.0 之前的版本时，使用来自 node.js 的 Async-Hook API；当运行 Nodejs 版本 12.17.0 或 13.10.0 之前的版本时，使用来自 node.js 的 AsyncLocalStorage。

- feat(web) supports environment sniffing request context: Async-Hook and AsyncLocalStorage. When running Nodejs version 8.12.0 to version before (12.17.0 or 13.10.0), use the Async-Hook API from node.js; When running a version later than Nodejs version (12.17.0 or 13.10.0), use AsyncLocalStorage from node.js.


## v1.23.2

- feat(cli-service) optimize the cache cleaning mechanism of node backend HMR module
- fix(compression) fix illegal attribute `cache`
- feat(cli-service+core) add polyflill of `process`

- feat(cli-service) 优化 node 后端 HMR 模块缓存清理机制
- fix(compression) 修复不合法属性 `cache`
- feat(cli-service+core) 添加 `process` 的 polyflill

## v1.23.1

- fix(cli) 修复隐式依赖版本不一致问题
- fix(cli-common) 优化组件版本一致性检查
- fix(cli) 升级 `vue-app` 模板中 vue-router 依赖版本

- fix(cli) fix the problem of implicit dependency version inconsistency
- fix(cli-common) optimize component version consistency check
- fix(cli) upgrade the vue-router dependent version in the `vue-app` template

## v1.23.0

- feat(schedule) add `@celljs/shedule` component.

## v1.22.2

- fix(cli-service) fix copy plugin options

## v1.22.1

- fix(vue+cli-service) fix the warning message brought by webpack upgrade
- fix(cli) fix `vue-app` template lack dependency error
- fix(vue+cli-service) 修复 webpack 升级带来的警告信息
- fix(cli) 修复 `vue-app` 模板缺少依赖错误

## v1.22.0

- feat(all) upgrade to webpack5


## v1.21.0

- feat(cli-common + core) el expression supports `eval` conversion, for example, `'1 + 3'| eval` results in `4`
- feat(fc-adapter + scf-adapter) optimized configuration file
- feat(cli-common+core) el 表达式支持 `eval` 转换，例如 `'1+3'|eval` 结果为 `4`
- feat(fc-adapter+scf-adapter) 优化配置文件


## v1.20.6

- fix(cli-common) fix npm peer error
- feat(cli-service) `cell.includeModules` defaults to `undefined`

## v1.20.5

- fix(all) fix types
- fix(cache) Fix redis configuration not taking effect

## v1.20.4

- feat(cli) update vue-app and sample-app template

## v1.20.3

- fix(cli) fix `admin-app` template

## v1.20.2

- fix(cli-service) fix source mapping loader warning

## v1.20.0

- feat(all) The compilation target changed from es5 to es6

## v1.19.3

- feat(adapter) Add code compression operation when deploying

## v1.19.2

- feat(rpc) support create JsonRpcProxy

## v1.19.1

- fix(vue) fix peer dep missing

## v1.19.0

- feat(cli) add a `scf-app` template

## v1.18.6

- feat(fc-adapter) support `CELL_DOMAIN` environment variables

## v1.18.5

- fix(cli-service) fix typo
- feat(vue): add style webpack loaders to support vue project

## v1.18.4

- fix(faas-adapter) using js-yaml load alternate salfLoad

## v1.18.3

- fix(cli) fix debug and cicd


## v1.18.2

- feat(cli+cli-common+cli-service) Optimize dependencies

## v1.18.1

- feat(compression) upgrade compression-webpack-plugin
- feat(typeorm) upgrade typeorm


## v1.18.0

- feat(cli) splits the original `@celljs/cli` command line tool into three parts: `@celljs/cli-common`, `@celljs/cli` and `@celljs/cli-service`. Among them, `@celljs/cli` will no longer rely on a series of heavy dependencies such as webpack, typescript, etc., and move related dependencies to `@celljs/cli-service`. In addition, the webpack plugin supports chain configuration.
- feat(oss) upgrade oss sdk
- feat (cli) `cell.includeModules` default changed to `true`
- feat (cli) specifies package management tools through `cell.packager`, currently supports npm and yarn tools, and if no display is specified, the framework will select the appropriate package management tools for the current project environment, giving preference to yarn tools.
- feat(cli) The consistency of command behavior is maintained whether the global cell command is executed or local.

- feat(cli) 将原先的 `@celljs/cli` 命令行工具拆分成三部分：`@celljs/cli-common`、`@celljs/cli` 和 `@celljs/cli-service`。其中，`@celljs/cli` 将不再依赖 webpack、typescript 等等一些列重型依赖，将相关的依赖移动到 `@celljs/cli-service` 中。另外，webpack 插件支持链式配置。
- feat(oss) 升级 oss sdk
- feat(cli) `cell.includeModules` 默认值改为 `true`
- feat(cli) 通过 `cell.packager` 指定包管理工具，目前支持 npm 和 yarn 工具，如果没有指定显示指定，框架会更具当前项目环境选择合适包管理工具，优先选择 yarn 工具。
- feat(cli) 无论是执行全局 cell 命令，还是局部，都将保持命令行为的一致性。

## v1.17.0

- feat(core+cli) The compilation period dynamic property configuration injection is consistent with the dynamic container assembly design
- fix(cli) Backend hot replacement adds cache cleanup node_modules the database, fixing the unpredictable behavior of typeorm database operations
- feat(core+cli) 编译期动态属性配置注入与动态容器组装设计保持一致
- fix(cli) 后端热替换添加对 node_modules 的缓存清理，修复 typeorm 数据库操作不可预期行为

## v1.16.12

- feat(fc-adapter) Ignore the header of function context and event

## v1.16.11

- fix(security+oauth2-client) End of missing response

## v1.16.10

- fix(serve-static) Optimized code

## v1.16.9

- fix(scf-adapter) Fix the function status error when deployed to Tencent Cloud Cloud function
- fix(scf-adapter) 修复部署到腾讯云云函数可能报函数状态错误

## v1.16.8

- fix(scf-adapter) set context.callbackWaitsForEmptyEventLoop to false to fix the asynchronous task timeout problem
- fix(scf-adapter) 设置 context.callbackWaitsForEmptyEventLoop 为 false，修复异步任务超时问题

## v1.16.7

- feat(core) adds `@Service()` decoration, currently `@Service()` and `@Component()` have the same effect. When adding a decorator to a service class, using `@Service()` will be better and more readable; when AOP interception is needed on the service class, separate the service class from other classes, which is more convenient for AOP Intercept.
- feat(core) 添加 `@Service()` 装饰，目前 `@Service()` 与 `@Component()` 效果是一样的。当给服务类添加装饰器的时候，使用 `@Service()` 会更好，可读性更强；当要对服务类进行 AOP 拦截的时候，将服务类与其他类进行分开，更方便 AOP 拦截。


## v1.16.6

- fix(cli) prompts for the AKSK information to be overwritten by other information during the first deployment
- fix(cli) 第一次部署提示输入 AKSK 信息被其他信息覆盖

## v1.16.5

- feat(fc-adapter) api gateway supports forceNonceCheck attribute configuration
- feat(fc-adapter) api gateway 支持 forceNonceCheck 属性配置

## v1.16.4

- feat(cli) CICD supports main branch main
- feat(cli) CICD 支持主分支 main

## v1.16.3

- feat(serve-static) does not cache html files by default
- fix(rpc) fixes the problem that the session setting in the rpc method does not take effect
- feat(typeorm) shields unnecessary warning messages

- feat(serve-static) 默认不缓存 html 文件
- fix(rpc) 修复在 rpc 方法中设置 session 不生效问题
- feat(typeorm) 屏蔽掉不必要的警告信息

## v1.16.2

- fix(serve-static) has an infinite loop without index.html
- feat(vue) optimize cdn loading logic
- fix(serve-static) 在没有 index.html 的情况下存在死循环
- feat(vue) 优化 cdn 加载逻辑


## v1.16.1

- fix(faas-adapter) fix profile loading priority
- feat(fc-adapter) The name of the API gateway group defaults to the name property of package.json
- fix(faas-adapter) 修复 profile 加载优先级
- feat(fc-adapter) API 网关组的名称默认为 package.json 的 name 属性

## v1.16.0

- fix(fc-adapter) fixes the second deployment error of a function of the api-gateway type
- feat (fc-adapter) the default service name is the name property of package.json
- fix(fc-adapter) 修复 api-gateway 类型的函数第二次部署报错
- feat(fc-adapter) 默认服务名称为 package.json 的 name 属性

## v1.15.3

- fix(vue) 加载 vue 的样式部分文报错

## v1.15.2

- fix(cli) to fix the error when using hook in `vue-app` template
- feat(vue) supports Vue CSS file parsing

- fix(cli) 修复 `vue-app` 模板在使用 Hook 时候报错
- feat(vue) 支持 vue css 文件解析

## v1.15.1
- feat(vue) Update vue configuration file
- feat(vue) 更新 vue 配置文件

## v1.15.0
- feat(cli) add vue related application templates
- feat(vue) Added `@celljs/vue` component, integrated vue capability

- feat(cli) 添加 vue 相关应用模板
- feat(vue) 添加 `@celljs/vue` 组件，集成 vue 能力

## v1.14.0
- feat(shell) Optimize the display of login status
- feat(shell) 优化登录状态的显示


## v1.13.1
- feat(security) Add tool class `AccessDecisionUtils` to facilitate manual verification of permissions
- feat(security) 添加工具类 `AccessDecisionUtils`，方便手动验证权限

## v1.13.0

- feat(core) remove the `TenantProvider` interface
- feat(web) `Context` adds get or set `Tenant` method
- feat(security) remove the implementation of the `TenantProvider` interface and set the `Tenant` in the security context middleware

- feat(core) 移除 `TenantProvider` 接口
- feat(web) `Context` 添加获取或设置 `Tenant` 方法
- feat(security) 移除 `TenantProvider` 接口实现，并在安全上下文中间件中设置 `Tenant`

## v1.12.2

- feat (web) code optimization, the convenience methods of `getUrl` and `getPath` added to the `UrlUtil` tool class
- feat(web) 代码优化，`UrlUtil` 工具类添加 `getUrl` 和 `getPath` 便捷方法

## v1.12.1

- fix(rpc) fix the GlobalConverter not found error and optimize the code
- fix(rpc) 修复做不到 GlobalConverter 错误，并优化代码

## v1.12.0

- feat(security) supports similar cloud vendor authorization policy mechanism `AclPolicy`
- feat(security) `PolicyResolver` no longer returns `true|false`, and returns three results: agree, deny and abstain
- feat(security) Add a new decorator `@Resource`, used to customize resource names, which can be added to classes and methods, and support EL expressions when added to methods. By default, the class name is used as the resource name, and the resource name will be used when determining permissions
- feat(security) adds a new decorator `@Action`, which is used to customize the action name and can only be loaded on the method. By default, the class name + method name is used as the action name, and the action name will be used when determining permissions
- feat(security) adds a new interface `ActionNameResolver` for resolving action names
- feat(security) unifies multiple interfaces of policy providers into one interface `PolicyProvider`

- feat(security) 支持类似云厂商授权策略机制 `AclPolicy`
- feat(security) `PolicyResolver` 不再返回 `true|false`，返回三种结果：同意、拒绝和弃权
- feat(security) 添加新装饰器 `@Resource`，用于自定义资源名称，可以加在类和方法上，加在方法上支持 EL 表达式。默认使用类名称作为资源名称，资源名称在权限判断的时候会使用到
- feat(security) 添加新装饰器 `@Action`，用于自定义动作名称，只能加载方法上。默认使用类名 + 方法名称作为动作名称，动作名称在权限判断的时候会使用到
- feat(security) 添加新接口 `ActionNameResolver`，用于解析动作名称
- feat(security) 将策略提供者多种接口统一成一个接口 `PolicyProvider`

## v1.11.0

- feat(all) Use project references to enable incremental compilation to speed up compilation
- feat(cli) multi-component template was renamed monorepo, and the content of the upgraded template was optimized
- feat(cli) optimize the hot replacement behavior of back-end type projects in monorepo projects

- feat(all) 使用项目引用，开启增量编译，加快编译速度
- feat(cli) multi-component 模板改名为 monorepo，并优化升级模板内容
- feat(cli) 优化后端类型项目在 monorepo 项目中热替换行为

## v1.10.0

- feat(core) adds support for multi-tenant, provides `TenantProvider` interface
- feat(security) provides an implementation of the `TenantProvider` interface
- feat(cloud) object storage service supports the `copyObject` method
- feat(cache) adds the `@celljs/cache` component, which integrates `cache-manager`, and provides memory-based storage strategies by default
- fix(oss) Fix the problem of incorrect transfer of token when using temporary AKSK

- feat(core) 添加对多租户的支持，提供了 `TenantProvider` 接口
- feat(security) 提供了 `TenantProvider` 接口的实现
- feat(cloud) 对象存储服务支持 `copyObject` 方法
- feat(cache) 添加 `@celljs/cache` 组件，该组件集成了 `cache-manager`，默认提供基于内存的存储策略
- fix(oss) 修复使用临时 AKSK 时，没有正确传递 Token 问题

## v1.9.4

- fix(scf-adapter) Fix the incorrect geographic list of Tencent Cloud SCF
- fix(cli) Exception message is not thrown as expected when executing cli hook
- feat(scf-adapter) scf sdk already supports the `TC3-HMAC-SHA256` signature algorithm, remove the workround implementation
- feat(grommet) Optimize localized component `LocalMenu`, add new component property `fontSize`

- fix(scf-adapter) 修复腾讯云函数的地域列表不正确问题
- fix(cli) 执行 cli hook 的时候异常信息没有按预期抛出来
- feat(scf-adapter) scf sdk 已经支持 `TC3-HMAC-SHA256` 签名算法，移除 workround 实现
- feat(grommet) 优化本地化组件 `LocalMenu`，添加新组件属性 `fontSize`

## v1.9.2

- feat(security) adds the enumeration type `UserType` and a method to determine whether it is a `User` object
- fix(security) fix the problem that non-authentication exceptions are not thrown correctly
- feat(security) Improve Github third-party authentication user information mapping rules

- feat(security) 添加枚举类型 `UserType` 和判断是否是 `User` 对象的方法
- fix(security) 修复非认证异常没有正确抛出问题
- feat(security) 完善 Github 第三方认证用户信息映射规则

## v1.9.1

- fix(cloud) misspelling
- fix(faas-adapter) fix the problem that the `include` behavior of the function code configuration `codeUri` does not meet expectations
- feat(cli) add templates related to file operations based on object storage
- feat(cli) delete unwanted attributes in the `cell.yml` file output by the component merge

- fix(cloud) 拼写错误
- fix(faas-adapter) 修复函数代码配置 `codeUri` 的 `include` 行为不符合预期问题
- feat(cli) 添加基于对象存储实现的文件操作相关的模板
- feat(cli) 删除组件合并输出的 `cell.yml` 文件中不需要的属性

## v1.9.0

- feat(cloud) abstracts a basic cloud computing component `@celljs/cloud`, abstracts unified interfaces and configurations for cloud products of different cloud vendors, developers can use unified interfaces to operate cloud service resources that do not require cloud vendors
- feat(oss + cos + s3) adds three new components: `@celljs/oss`, `@celljs/cos`, `@celljs/s3`, respectively for the object storage resources of Alibaba Cloud, Tencent Cloud and Amazon Cloud Implementation of the operation interface
- feat(faas-adapter) adds a new component: `@celljs/faas-adapter`, this component is an adapter summary for FaaS scenarios, and does not need to be implemented by cloud vendors’ Faa adapter extension `@celljs/faas-adapter`
- feat(faas-adapter) extends the new command: `cell config`, through which the account is manually configured, and AKSK related information
- feat(lambda-adapter) add a new component: `@celljs/lambda-adapter`, use Amazon cloud Apigateway + lambda to implement application deployment
- feat(faas-adapter) deployment related configuration is unified to the configuration of `cell.faas-adapter` property

- feat(cloud) 抽象了一个云计算基础组件 `@celljs/cloud`，对不同的云厂商的云产品抽象统一的接口和配置，开发者可以使用统一的接口操作不用云厂商的云服务资源
- feat(oss + cos + s3) 添加三个新组件：`@celljs/oss`、`@celljs/cos`、`@celljs/s3`，分别对阿里云、腾讯云和亚马逊云的对象存储资源操作接口的实现
- feat(faas-adapter) 添加新组件：`@celljs/faas-adapter`，该组件是对 FaaS 场景的适配器抽象，不用云厂商的 FaaS 适配器扩展 `@celljs/faas-adapter` 组件实现
- feat(faas-adapter) 扩展新的命令：`cell config`，通过该命令手动配置账号、AKSK 相关的信息
- feat(lambda-adapter) 添加新组件：`@celljs/lambda-adapter`，使用亚马逊云的 Apigateway + lambda 实现应用部署
- feat(faas-adapter) 部署相关的配置全部统一到 `cell.faas-adapter` 属性上配置

## v1.8.1

- feat(cli) supports version update notification
- feat(cli) 支持版本更新通知

## v1.8.0

- feat(cli) add the `cell.webpack.sourceMaploaderExclude` property to ignore the warning message that the source map cannot be loaded
- feat(cli) build and release code also generates the `cell.yml` file to the `.cell` directory, which can be ignored by the `codeUri` property of the function. The default is to ignore the upload of the `cell.yml` file to prevent some private information Give way
- feat(fc-adapter) adds the `codeUri` property configuration to the function, and the default value is to ignore the upload of the `cell.yml` file
- feat(scf-adapter) adds the `codeUri` property configuration to the function, and the default value is to ignore the upload of the `cell.yml` file
- feat(puppeteer) add @celljs/puppeteer component
- feat(cli) add `puppeteer` application template
- feat(mvc) adds the file view `FileView` to facilitate the implementation of file download related APIs. It also provides a simplified decorator `@File()`, and also provides `@Text()`, `@Json()` , `@Html()` decorator simplifies the ability to use different types of views

- feat(cli) 添加 `cell.webpack.sourceMaploaderExclude` 属性，用于忽略 source map 加载不到警告信息
- feat(cli) 构建发布代码也生成 `cell.yml` 文件到 `.cell` 目录，可以通过函数的 `codeUri` 属性进行忽略，默认是忽略 `cell.yml` 文件上传的，防止一些私密信息泄露
- feat(fc-adapter) 为函数添加 `codeUri` 属性配置，且默认值为忽略掉 `cell.yml` 文件的上传
- feat(scf-adapter) 为函数添加 `codeUri` 属性配置，且默认值为忽略掉 `cell.yml` 文件的上传
- feat(puppeteer) 添加 @celljs/puppeteer 组件
- feat(cli) 添加 `puppeteer` 应用模板
- feat(mvc) 添加文件视图 `FileView`，方便实现文件下载相关 API，同时也提供简化的装饰器 `@File()`，另外也提供了 `@Text()`、`@Json()`、`@Html()` 装饰器简化使用不同类型视图能力

## v1.7.0

- feat(core) optimizes the AOP user interface and provides the decorator `@Aspect()`
- feat(core) `@Component()` Add `sysTags` for classifying object labels injected into the container to facilitate AOP control of the intercept scope based on `sysTags`
- feat(core) `@Component() ` Add default values for configuration properties: `cell.annotation.
- feat(core) Adds AOP global switch control: `cell.aop.enabled`, enabled by default
- feat(security) Adds secure intercept access control: `cell.security.aop.pointcut`, which defaults to `Endpoint`, which means intercept all external endpoint processors
- feat(security) adds front-end abstraction for easy integration with SPA.
- feat(security) Adds a user info fetch endpoint, defaults to `/userinfo`.
- fix(oauth2-client) Fix the problem of not being able to get user information based on OAuth2.0 authentication.
- fix(security) optimizes the permission decision algorithm and adds a resource pattern to match the permission configuration
- fix (security) supports Base certification
- fix(core) optimizes a large amount of code

- feat(core) 优化 AOP 用户接口，提供装饰器`@Aspect()`
- feat(core) `@Component()` 添加 `sysTags`，用于给注入到容器的对象标签分类，方便 AOP 基于 `sysTags` 控制拦截范围
- feat(core) `@Component()` 添加默认值配置属性：`cell.annotation.Component`
- feat(core) 添加 AOP 全局开关控制：`cell.aop.enabled`，默认开启
- feat(security) 添加安全拦截访问控制：`cell.security.aop.pointcut`，默认值为 `Endpoint`，表示拦截所有的对外端点处理器 
- feat(security) 添加前端抽象，方便与 SPA 集成使用
- feat(security) 添加获取用户信息端点，默认为 `/userinfo`
- fix(oauth2-client) 修复基于 OAuth2.0 认证无法获取用户信息问题
- fix(security) 优化权限决策算法，添加资源模式匹配权限配置
- fix(security) 支持 Base 认证
- fix(core) 优化大量代码


## v1.6.0

- feat(web) adds gzip compression optimization to the cookie-based session storage scheme, greatly alleviating the 4KB request header limitation in Serverless scenarios, while also reducing the request header transfer burden
- feat(grommet) Optimize the LocaleMenu component
- feat(grommet) update Cellbang icon
- feat(fact) adds `@Icon()` decorator for injecting custom icon components
- feat(cli) provides the default site icon, the template no longer provides favicon.ico files, developers can override the default by placing a custom favicon.ico file at the root of the project
- feat(security + oauth2-client) provides authentication success custom redirect URL capability for OIDC authentication
- feat(web) 基于 Cookie 的 Session 存储方案添加 gzip 压缩优化，极大缓解在 Serverless 场景下的请求头 4KB 限制，同时也减轻请求头传输负担
- feat(grommet) 优化 LocaleMenu 组件
- feat(grommet) 更新 Cellbang 图标
- feat(react) 添加 `@Icon()` 装饰器，用于注入自定义的图标组件
- feat(cli) 提供默认网站图标，模板中不再提供 favicon.ico 文件，开发者可以通过在项目根下放置自定义的 favicon.ico 文件覆盖默认
- feat(security + oauth2-client) 为 OIDC 认证提供认证成功自定义重定向 URL 能力


## v1.5.1
- feat (cli) supports static module configuration `staticModules` to avoid repeated packaging of public modules for dynamic modules
- feat (cli) built-in es6 to es5 capability, specify the module to be converted through attribute configuration
- feat(cli) 支持静态模块配置 `staticModules`，避免动态模块重复打包公共模块
- feat(cli) 内置 es6 转 es5 能力，通过属性配置方式指定需要转换的模块

## v1.5.0
- feat(rpc) Rpc style interface supports multi-request merging, which greatly reduces the cold start probability in Serverless scenarios; under high concurrency, it greatly reduces the number of requests, thereby reducing the impact of distributed network delays. Zero code transformation and zero configuration
- feat(rpc) Rpc 风格接口支持多请求合并，极大减少 Serverless 场景下冷启动概率；高并发情况下，极大减少请求次数，从而减弱分布式网络延迟的影响。零代码改造和零配置

## v1.4.1
- feat(cli) Support microservice templates
- feat(cli) 支持微服务模板

## v1.4.0
- feat(rpc) Supports JSON RPC communication protocol microservices, so that the front-end and BFF, BFF and microservices, and microservices and microservices communicate in a unified style
- feat(cli) Loads the `lib/common/module.j|ts` file of the component by default as the front and back public module
- feat(rpc) 支持 JSON RPC 通信协议的微服务，让前端与 BFF、BFF 与微服务、微服务与微服务的通信方式统一风格
- feat(cli) 默认加载组件的 `lib/common/module.j|ts` 文件作为前后端公共模块

## v1.3.0
- feat(compression) 添加 compression 组件，提供前端静态文件 gzip 压缩能力，开箱即用
- feat(compression) Adds compression components to provide front-end static file gzip compression capabilities out of the box

## v1.2.0
- fix(node-debug): Replacing node with pwa-node
- fix(launch.json): Delete outFiles
- fix(core): removeLisners -> removeListeners
- feat(oidc-provider) Add component oidc-provider
- feat(fc-adapter) The HTTP trigger name is generated based on the function name
- feat(cli) Optimize command line plugin loading mechanism

- fix(node-debug) 用 pwa-node 替换 node
- fix(launch.json) 删除 outFiles
- fix(core): removeLisners -> removeListeners
- feat(oidc-provider) 添加组件 oidc-provider
- feat(fc-adapter) HTTP 触发器的名称是基于函数名生成的
- feat(cli) 优化命令行插件加载机制

## v1.1.0
- feat(core) Upgrade vscode-ws-jsonrpc version
- feat(core) Decorator `@Component()` supports name, tag, default, when attributes
- feat(core) Add new decorators `@Named()`, `@Tagged()`, `@TargetName()`, `@PostConstruct()`
- feat(rpc) Supports error converter ʻErrorConverter`
- feat(cli) `.cell/backend/cell.yml` and `.cell/backend/cell.yml` obtained by merging all components will only be generated during the local development process

- feat(core) 升级 vscode-ws-jsonrpc 版本
- feat(core) 装饰器 `@Component()` 支持 name、tag、default、when 属性
- feat(core) 添加新的装饰器 `@Named()`、`@Tagged()`、`@TargetName()`、`@PostConstruct()`
- feat(rpc) 支持错误转换器 `ErrorConverter`
- feat(cli) 合并所有组件得到的 `.cell/backend/cell.yml` 和 `.cell/backend/cell.yml` 只会在本地开发过程才会生成

**Breaking Changes:**
- feat(core) 装饰器 `@Optional()` 必须得带小括号
- feat(core) Decorator `@Optional()` must have parentheses


## v1.0.8
- feat(cli) Modify the use of template variables
- feat(serve-static) supports configuring response headers through configuration properties
- feat(cli) supports module deduplication
- feat(cli) 修改模板变量的使用
- feat(serve-static) 支持通过配置属性配置响应头
- feat(cli) 支持模块去重

## v1.0.7
- fix(cli) Fix command line plugin not found in monorepo style projects
- feat(cli) adjust the loading priority of index.html and favicon.ico under the project root, which is greater than the attribute configuration
- feat(core) adds a getAll method to the tool class ConfigUtil to facilitate obtaining the application configuration before the IoC container is built
- fix(cli) 修复 monorepo 风格的项目中找不到命令行插件
- feat(cli) 调整项目根下面的 index.html 和 favicon.ico 加载优先级，大于属性配置
- feat(core) 为工具类 ConfigUtil 添加 getAll 方法，方便在 IoC 容器构建之前获取应用配置 

## v1.0.6

- fix(fc-adapter) Fix spelling errors 
- fix(fc-adapter) 修复拼写错误 

## v1.0.5

- fix(rpc) When the target of class compilation output is esnext, the class method cannot be enumerated, which causes the method members not to be traversed by `for in`
- fix(rpc) 修复类编译输出目标为 esnext 时，类方法不可枚举，导致 `for in` 遍历不出来方法成员

## v1.0.3

- fix(cli) Fix the single-step debugging cannot find the module error
- fix(cli) Fix the warning that the sourcemap file cannot be found in single-step debugging
- fix(cli) 修复单步调试找不到模块错误
- fix(cli) 修复单步调试找不到 sourcemap 文件警告

## v1.0.2

- fix(cli) Add missing leven module
- fix(cli) 添加缺少的 leven 模块

## v1.0.1

- feat(cli) Update template favicon


## v1.0.0

- feat(cli) Update readme file


## v0.0.44

- feat(pwa) Add pwa component
- feat(eslint) Add eslint component
- feat(cli) Remove pwa function
- feat(cli) Remove eslint function
- feat(cli) Simplified application template configuration
- feat(fc-adapter + scf-adapter) Simplifies the stage configuration and automatically judges the stage according to the operating mode. When test mode is included, stage is test, when pre mode is included, stage is pre, and when prod mode is included, stage is prod
- feat(cli) Add cli hook, through this plug-in you can add new commands and extend old commands
- feat(cli) Beautify the command line output log
- feat(cli) Add command smart suggestions
- feat(pwa) 添加 pwa 组件
- feat(eslint) 添加 eslint 组件
- feat(cli) 移除 pwa 功能
- feat(cli) 移除 eslint 功能
- feat(cli) 简化应用模板配置
- feat(fc-adapter + scf-adapter) 简化 stage 配置，根据运行模式自动判断 stage。当包含 test 模式，则 stage 为 test，当包含 pre 模式，则 stage 为 pre，当包含 prod 模式，则 stage 为 prod
- feat(cli) 添加 cli hook，通过该插件可以添加新的命令和扩展老的命令
- feat(cli) 美化命令行输出日志
- feat(cli) 添加命令智能建议


## v0.0.43

- feat(cli) `cell init` command supports specifying template options, you can specify the built-in template name and remote GitHub address, such as: `cell init demo fc-backend-app` or `cell init demo git@github.com:cellbang/cellbang-site.git`
- feat(widget+shell) component property change: `cell.widget.locales` changed to `cell.locales`
- feat(widget) component property change: `cell.widget.themes` changed to `cell.themes`

- feat(cli) `cell init` 命令支持指定模板选项，可以指定内置模板名称和远端 GitHub 地址，如：`cell init demo fc-backend-app` 或者 `cell init demo git@github.com:cellbang/cellbang-site.git`
- feat(widget+shell) 组件属性变更：`cell.widget.locales` 变更为 `cell.locales`
- feat(widget) 组件属性变更：`cell.widget.themes` 变更为 `cell.themes` 

## v0.0.42

- fix(cli) Fix the problem of fc-admin-app template package shortage
- fix(cli) Fix template configuration file error
- fix(cli) 修复fc-admin-app 模板少包问题
- fix(cli) 修复模板配置文件错误问题

## v0.0.41

- feat(fc-adapter + scf-adapter + vercel + cli) Remove the configuration attribute deployConfig, and put the configuration attributes under deployConfig to the child of the specific adaptation component
- feat(fc-adapter) When configuring the route of a custom domain name, the route configuration is changed to be updated by appending instead of overwriting (#1)
- feat(fc-adapter) When configuring the route of a custom domain name, you can automatically calculate the service, function and alias name without specifying it

- feat(fc-adapter + scf-adapter + vercel + cli) 移除配置属性 deployConfig，将 deployConfig 下面的配置属性放到具体适配组件子级
- feat(fc-adapter) 配置自定义域名的路由时，路由配置改为以追加的方式进行更新，而非覆盖
- feat(fc-adapter) 配置自定义域名的路由时，可以不指定服务、函数以及别名名称，自动计算


## v0.0.40

- feat(oauth2): add oauth2-core, oauth2-jose, oauth2-client components

## v0.0.39

- fix(cli) When the backend uses webpack to exclude a certain package and installs the package to the build directory when building, after publishing it online, the excluded package is not packaged and uploaded correctly
- fix(cli) 当后端使用 webpack 排除某一个包，并构建的时候安装该包到构建目录时，发布到线上后，排除的包没有被正确打包上传

## v0.0.38

- fix(fc-adaper+scf-adaper) Fix the code file permission problem under Windows system
- fix(fc-adaper+scf-adaper) 修复 Windows 系统下代码文件权限问题

## v0.0.37

- fix(web+fc-adapter) fix cors function release to function calculation does not take effect
- fix(typeorm) fix the local running modification code hot loading causes the database link to have an error
- fix(core) fix the "EventEmitter memory leak detected" warning caused by hot loading of local running modified code

- fix(web+fc-adapter) 修复 cors 功能发布到函数计算不生效
- fix(typeorm) 修复本地运行修改代码热加载导致数据库链接已经存在错误
- fix(core) 修复本地运行修改代码热加载导致 “EventEmitter memory leak detected” 警告

## v0.0.36

- feat(cli + core) property file supports regular expression properties: ${{'.*\.google\.com$'|regexp}}
- fix(web) run locally to remove the hard-coded configuration of cors

- feat(cli + core) 属性文件支持正则表达式属性：${{'.*\.google\.com$'|regexp}}
- fix(web) 本地运行去掉 cors 硬编码配置


## v0.0.35

- fix(cli) fix class-transformer compilation warning
- fix(cli) 修复 class-transformer 编译警告

## v0.0.34

- fix(cli) fix the compatibility problem of cli tool in windows environment
- feat(core) upgrade class-transformer
- feat(grommet) optimize the style of NavItem component

- feat(grommet) 优化 NavItem 组件样式
- fix(cli) 修复 cli 工具在 windows 环境下存在的兼容性问题
- feat(core) 升级 class-transformer


## v0.0.33


- fix(cli) fix FilterWarningsPlugin configuration
- fix(typeorm) fix typeorm component configuration

- fix(cli) 修复 FilterWarningsPlugin 配置
- fix(typeorm) 修复 typeorm 组件配置


## v0.0.32
- The feat(cli) compilation process supports progress display
- The local operation of feat(cli) disables the PWA function by default, which can be manually turned on through cell.webpack.workboxWebpackPlugin.generateInDevMode configuration, and the PWA function will be automatically turned on when publishing
- feat(cli) admin-app template update
- feat(core) optimize online and local log levels
- feat(widget) completes the design and implementation of the first version of the widget. The widget provides the ability to dynamically assemble, configure and expand the front-end page, and it is also the basic ability of the future micro-front-end and visualization
- feat(shell) adds a shell component and provides a highly extensible layout component by default
- feat(react) completed the first version of Slot design and implementation, so that front-end components can be injected into a slot, and dynamically manage front-end components, namely widgets
- feat(widget+react+grommet) internationalization, multi-theme, communication between front-end components (rxjs) design and implementation
- feat (cli) template supports github actions configuration

- feat(cli) 编译构建过程支持进度显示
- feat(cli) 本地运行默认关闭 PWA 功能，可以通过 cell.webpack.workboxWebpackPlugin.generateInDevMode 配置手动开启，发布的时候会自动开启 PWA 功能
- feat(cli) admin-app 模板更新
- feat(core) 优化线上和本地日志级别
- feat(widget) 完成 widget 第一版设计与实现，通过 widget 提供前端页面的动态组装、配置和扩展的能力，同时也是未来微前端和可视化的基础能力
- feat(shell) 添加 shell 组件，默认提供了一个高度可扩展的布局组件
- feat(react) 完成第一版 Slot 设计与实现，让前端组件可以被注入到某个 Slot，动态管理前端组件，即 widget
- feat(widget+react+grommet) 国际化、多主题、前端组件之间通信（rxjs）设计与实现
- feat（cli）模板支持github actions 配置

## v0.0.31

- feat(fc-adapter + scf-adapter + express-adapter) supports urlencoded request content type
- feat(fc-adapter + scf-adapter + express-adapter) 支持urlencoded 请求内容类型

## v0.0.30

- fix(fc-adapter) Fix and optimize HTTS certificate configuration
- fix(fc-adapter) 修复并优化 HTTS 证书配置

## v0.0.29

- feat(cli+core) In the configuration of a node in the component configuration, if the _ignoreEl attribute is true, the expression calculation of the configuration node and child nodes is ignored
- feat(cli+core) ignores the expression calculation under the configuration node such as env by default

- feat(cli+core) 组件配置中某个节点配置如果存在 _ignoreEl 属性为 true，则忽略该配置节点以及子节点的表达式计算
- feat(cli+core) 默认忽略 env 等配置节点下面的表达式计算

## v0.0.28

- feat(cli) Change the compilation target to es6
- feat(cli) 变更编译目标到 es6

## v0.0.27

- fix(cli) Fix cell init command execution failure
- fix(cli) 修复 cell init 命令执行失败

## v0.0.26

- fix(react+material-ul) remove @Context id

## v0.0.25
- feat(cli) optimizes command line execution speed by loading modules on demand
- feat(core) front-end application is no longer directly in the body, and provides a div container with an id of cell.hostDomId
- feat(cli) provides a default html template, if the index.html file exists in the project root directory, it will overwrite the default provided template
- feat(serve-static) defines two component attributes: path and apiPath, path matches the front-end route, and apiPath matches the back-end route
- feat(cli) adds the base tag to the default html template to allow the resources in html to be loaded by absolute routing
- feat(cli) serve, build and deploy add parameter entry and options -t, --targets uniformly, support non-cell framework operation, build and deployment
- feat(cli) build command adds options -o, --output, custom code output location

- feat(cli) 通过按需加载模块优化命令行执行速度
- feat(core) 前端应用不再直接 body 里面，提供了一个 id 为 cell.hostDomId 的 div 容器
- feat(cli) 提供一个默认的 html 模板，如果项目根目录存在 index.html 文件，会覆盖默认提供的模板
- feat(serve-static) 定义了两个组件属性：path 和 apiPath，path 匹配的前端路由，而 apiPath 匹配的是后端路由
- feat(cli) 默认 html 模板中添加 base 标签，让 html 中的资源以绝对路由的方式加载
- feat(cli) serve、build 和 deploy 统一添加参数 entry 和选项 -t, --targets，支持非 cell 框架运行、构建和部署
- feat(cli) build 命令添加选项 -o, --output，自定义代码输出位置


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

- feat(fc-adpater) Optimized the default value of cell.server.endpoint
- feat(cli) The sample-app template adds serve-static dependencies
- feat(fc-adpater) Optimized configHooks logic

## v0.0.21

- fix(fc-adapter) Fix cell.server.path default value
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
