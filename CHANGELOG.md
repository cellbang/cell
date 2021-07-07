# Change Log

## v1.26.0

- feat(scf-adapter) Support Web Function 

## v1.25.1
- feat(all) Change to rely on fixed version
- feat(all) 改为依赖固定版本

## v1.25.0

- feat(faas-adapter+fc-adapter) supports mns topic message queue trigger, which is enabled by the mode attribute `mode: [mns-topic] `. The sample configuration is as follows:
```yaml
mode: [ mns-topic ]
malagu:
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
malagu:
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

- feat(schedule) add `@malagu/shedule` component.

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
- feat(cli-service) `malagu.includeModules` defaults to `undefined`

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

- feat(fc-adapter) support `MALAGU_DOMAIN` environment variables

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

- feat(cli) splits the original `@malagu/cli` command line tool into three parts: `@malagu/cli-common`, `@malagu/cli` and `@malagu/cli-service`. Among them, `@malagu/cli` will no longer rely on a series of heavy dependencies such as webpack, typescript, etc., and move related dependencies to `@malagu/cli-service`. In addition, the webpack plugin supports chain configuration.
- feat(oss) upgrade oss sdk
- feat (cli) `malagu.includeModules` default changed to `true`
- feat (cli) specifies package management tools through `malagu.packager`, currently supports npm and yarn tools, and if no display is specified, the framework will select the appropriate package management tools for the current project environment, giving preference to yarn tools.
- feat(cli) The consistency of command behavior is maintained whether the global malagu command is executed or local.

- feat(cli) 将原先的 `@malagu/cli` 命令行工具拆分成三部分：`@malagu/cli-common`、`@malagu/cli` 和 `@malagu/cli-service`。其中，`@malagu/cli` 将不再依赖 webpack、typescript 等等一些列重型依赖，将相关的依赖移动到 `@malagu/cli-service` 中。另外，webpack 插件支持链式配置。
- feat(oss) 升级 oss sdk
- feat(cli) `malagu.includeModules` 默认值改为 `true`
- feat(cli) 通过 `malagu.packager` 指定包管理工具，目前支持 npm 和 yarn 工具，如果没有指定显示指定，框架会更具当前项目环境选择合适包管理工具，优先选择 yarn 工具。
- feat(cli) 无论是执行全局 malagu 命令，还是局部，都将保持命令行为的一致性。

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
- feat(vue) Added `@malagu/vue` component, integrated vue capability

- feat(cli) 添加 vue 相关应用模板
- feat(vue) 添加 `@malagu/vue` 组件，集成 vue 能力

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
- feat(cache) adds the `@malagu/cache` component, which integrates `cache-manager`, and provides memory-based storage strategies by default
- fix(oss) Fix the problem of incorrect transfer of token when using temporary AKSK

- feat(core) 添加对多租户的支持，提供了 `TenantProvider` 接口
- feat(security) 提供了 `TenantProvider` 接口的实现
- feat(cloud) 对象存储服务支持 `copyObject` 方法
- feat(cache) 添加 `@malagu/cache` 组件，该组件集成了 `cache-manager`，默认提供基于内存的存储策略
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
- feat(cli) delete unwanted attributes in the `malagu.yml` file output by the component merge

- fix(cloud) 拼写错误
- fix(faas-adapter) 修复函数代码配置 `codeUri` 的 `include` 行为不符合预期问题
- feat(cli) 添加基于对象存储实现的文件操作相关的模板
- feat(cli) 删除组件合并输出的 `malagu.yml` 文件中不需要的属性

## v1.9.0

- feat(cloud) abstracts a basic cloud computing component `@malagu/cloud`, abstracts unified interfaces and configurations for cloud products of different cloud vendors, developers can use unified interfaces to operate cloud service resources that do not require cloud vendors
- feat(oss + cos + s3) adds three new components: `@malagu/oss`, `@malagu/cos`, `@malagu/s3`, respectively for the object storage resources of Alibaba Cloud, Tencent Cloud and Amazon Cloud Implementation of the operation interface
- feat(faas-adapter) adds a new component: `@malagu/faas-adapter`, this component is an adapter summary for FaaS scenarios, and does not need to be implemented by cloud vendors’ Faa adapter extension `@malagu/faas-adapter`
- feat(faas-adapter) extends the new command: `malagu config`, through which the account is manually configured, and AKSK related information
- feat(lambda-adapter) add a new component: `@malagu/lambda-adapter`, use Amazon cloud Apigateway + lambda to implement application deployment
- feat(faas-adapter) deployment related configuration is unified to the configuration of `malagu.faas-adapter` property

- feat(cloud) 抽象了一个云计算基础组件 `@malagu/cloud`，对不同的云厂商的云产品抽象统一的接口和配置，开发者可以使用统一的接口操作不用云厂商的云服务资源
- feat(oss + cos + s3) 添加三个新组件：`@malagu/oss`、`@malagu/cos`、`@malagu/s3`，分别对阿里云、腾讯云和亚马逊云的对象存储资源操作接口的实现
- feat(faas-adapter) 添加新组件：`@malagu/faas-adapter`，该组件是对 FaaS 场景的适配器抽象，不用云厂商的 FaaS 适配器扩展 `@malagu/faas-adapter` 组件实现
- feat(faas-adapter) 扩展新的命令：`malagu config`，通过该命令手动配置账号、AKSK 相关的信息
- feat(lambda-adapter) 添加新组件：`@malagu/lambda-adapter`，使用亚马逊云的 Apigateway + lambda 实现应用部署
- feat(faas-adapter) 部署相关的配置全部统一到 `malagu.faas-adapter` 属性上配置

## v1.8.1

- feat(cli) supports version update notification
- feat(cli) 支持版本更新通知

## v1.8.0

- feat(cli) add the `malagu.webpack.sourceMaploaderExclude` property to ignore the warning message that the source map cannot be loaded
- feat(cli) build and release code also generates the `malagu.yml` file to the `.malagu` directory, which can be ignored by the `codeUri` property of the function. The default is to ignore the upload of the `malagu.yml` file to prevent some private information Give way
- feat(fc-adapter) adds the `codeUri` property configuration to the function, and the default value is to ignore the upload of the `malagu.yml` file
- feat(scf-adapter) adds the `codeUri` property configuration to the function, and the default value is to ignore the upload of the `malagu.yml` file
- feat(puppeteer) add @malagu/puppeteer component
- feat(cli) add `puppeteer` application template
- feat(mvc) adds the file view `FileView` to facilitate the implementation of file download related APIs. It also provides a simplified decorator `@File()`, and also provides `@Text()`, `@Json()` , `@Html()` decorator simplifies the ability to use different types of views

- feat(cli) 添加 `malagu.webpack.sourceMaploaderExclude` 属性，用于忽略 source map 加载不到警告信息
- feat(cli) 构建发布代码也生成 `malagu.yml` 文件到 `.malagu` 目录，可以通过函数的 `codeUri` 属性进行忽略，默认是忽略 `malagu.yml` 文件上传的，防止一些私密信息泄露
- feat(fc-adapter) 为函数添加 `codeUri` 属性配置，且默认值为忽略掉 `malagu.yml` 文件的上传
- feat(scf-adapter) 为函数添加 `codeUri` 属性配置，且默认值为忽略掉 `malagu.yml` 文件的上传
- feat(puppeteer) 添加 @malagu/puppeteer 组件
- feat(cli) 添加 `puppeteer` 应用模板
- feat(mvc) 添加文件视图 `FileView`，方便实现文件下载相关 API，同时也提供简化的装饰器 `@File()`，另外也提供了 `@Text()`、`@Json()`、`@Html()` 装饰器简化使用不同类型视图能力

## v1.7.0

- feat(core) optimizes the AOP user interface and provides the decorator `@Aspect()`
- feat(core) `@Component()` Add `sysTags` for classifying object labels injected into the container to facilitate AOP control of the intercept scope based on `sysTags`
- feat(core) `@Component() ` Add default values for configuration properties: `malagu.annotation.
- feat(core) Adds AOP global switch control: `malagu.aop.enabled`, enabled by default
- feat(security) Adds secure intercept access control: `malagu.security.aop.pointcut`, which defaults to `Endpoint`, which means intercept all external endpoint processors
- feat(security) adds front-end abstraction for easy integration with SPA.
- feat(security) Adds a user info fetch endpoint, defaults to `/userinfo`.
- fix(oauth2-client) Fix the problem of not being able to get user information based on OAuth2.0 authentication.
- fix(security) optimizes the permission decision algorithm and adds a resource pattern to match the permission configuration
- fix (security) supports Base certification
- fix(core) optimizes a large amount of code

- feat(core) 优化 AOP 用户接口，提供装饰器`@Aspect()`
- feat(core) `@Component()` 添加 `sysTags`，用于给注入到容器的对象标签分类，方便 AOP 基于 `sysTags` 控制拦截范围
- feat(core) `@Component()` 添加默认值配置属性：`malagu.annotation.Component`
- feat(core) 添加 AOP 全局开关控制：`malagu.aop.enabled`，默认开启
- feat(security) 添加安全拦截访问控制：`malagu.security.aop.pointcut`，默认值为 `Endpoint`，表示拦截所有的对外端点处理器 
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
- feat(cli) `.malagu/backend/malagu.yml` and `.malagu/backend/malagu.yml` obtained by merging all components will only be generated during the local development process

- feat(core) 升级 vscode-ws-jsonrpc 版本
- feat(core) 装饰器 `@Component()` 支持 name、tag、default、when 属性
- feat(core) 添加新的装饰器 `@Named()`、`@Tagged()`、`@TargetName()`、`@PostConstruct()`
- feat(rpc) 支持错误转换器 `ErrorConverter`
- feat(cli) 合并所有组件得到的 `.malagu/backend/malagu.yml` 和 `.malagu/backend/malagu.yml` 只会在本地开发过程才会生成

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

- feat(cli) `malagu init` command supports specifying template options, you can specify the built-in template name and remote GitHub address, such as: `malagu init demo fc-backend-app` or `malagu init demo git@github.com:cellbang/cellbang-site.git`
- feat(widget+shell) component property change: `malagu.widget.locales` changed to `malagu.locales`
- feat(widget) component property change: `malagu.widget.themes` changed to `malagu.themes`

- feat(cli) `malagu init` 命令支持指定模板选项，可以指定内置模板名称和远端 GitHub 地址，如：`malagu init demo fc-backend-app` 或者 `malagu init demo git@github.com:cellbang/cellbang-site.git`
- feat(widget+shell) 组件属性变更：`malagu.widget.locales` 变更为 `malagu.locales`
- feat(widget) 组件属性变更：`malagu.widget.themes` 变更为 `malagu.themes` 

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
- The local operation of feat(cli) disables the PWA function by default, which can be manually turned on through malagu.webpack.workboxWebpackPlugin.generateInDevMode configuration, and the PWA function will be automatically turned on when publishing
- feat(cli) admin-app template update
- feat(core) optimize online and local log levels
- feat(widget) completes the design and implementation of the first version of the widget. The widget provides the ability to dynamically assemble, configure and expand the front-end page, and it is also the basic ability of the future micro-front-end and visualization
- feat(shell) adds a shell component and provides a highly extensible layout component by default
- feat(react) completed the first version of Slot design and implementation, so that front-end components can be injected into a slot, and dynamically manage front-end components, namely widgets
- feat(widget+react+grommet) internationalization, multi-theme, communication between front-end components (rxjs) design and implementation
- feat (cli) template supports github actions configuration

- feat(cli) 编译构建过程支持进度显示
- feat(cli) 本地运行默认关闭 PWA 功能，可以通过 malagu.webpack.workboxWebpackPlugin.generateInDevMode 配置手动开启，发布的时候会自动开启 PWA 功能
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

- fix(cli) Fix malagu init command execution failure
- fix(cli) 修复 malagu init 命令执行失败

## v0.0.26

- fix(react+material-ul) remove @Context id

## v0.0.25
- feat(cli) optimizes command line execution speed by loading modules on demand
- feat(core) front-end application is no longer directly in the body, and provides a div container with an id of malagu.hostDomId
- feat(cli) provides a default html template, if the index.html file exists in the project root directory, it will overwrite the default provided template
- feat(serve-static) defines two component attributes: path and apiPath, path matches the front-end route, and apiPath matches the back-end route
- feat(cli) adds the base tag to the default html template to allow the resources in html to be loaded by absolute routing
- feat(cli) serve, build and deploy add parameter entry and options -t, --targets uniformly, support non-malagu framework operation, build and deployment
- feat(cli) build command adds options -o, --output, custom code output location

- feat(cli) 通过按需加载模块优化命令行执行速度
- feat(core) 前端应用不再直接 body 里面，提供了一个 id 为 malagu.hostDomId 的 div 容器
- feat(cli) 提供一个默认的 html 模板，如果项目根目录存在 index.html 文件，会覆盖默认提供的模板
- feat(serve-static) 定义了两个组件属性：path 和 apiPath，path 匹配的前端路由，而 apiPath 匹配的是后端路由
- feat(cli) 默认 html 模板中添加 base 标签，让 html 中的资源以绝对路由的方式加载
- feat(cli) serve、build 和 deploy 统一添加参数 entry 和选项 -t, --targets，支持非 malagu 框架运行、构建和部署
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