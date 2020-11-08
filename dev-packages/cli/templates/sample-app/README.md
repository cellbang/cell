# 开发说明

## 安装依赖

以下使用 yarn 工具来说明，你也可以使用 npm。

```bash
# 通过 malagu init 初始化应用的时候已经自动安装了依赖，所以你只需要安装你额外需要的依赖即可

$ yarn add xxxx
```

## 本地运行

```shell
# 启动本地服务，端口默认 3000
# 在终端中会输出本地服务的 URL 链接

$ yarn start  # 或者执行 malagu serve 命令
```

## 构建部署

模板默认提供了四套隔离环境：本地（local）、测试（test）、预发（pre）、线上（prod）。每个环境对于这一个 malagu 配置文件（可选），类似 malagu-test.yml。而 malagu.yml 文件一般用于放所有环境的公共配置。第一次部署的时候可能会提示你填写相关云厂商 ak 信息。如果是 Vercel 云平台的模板，会提示你需要登录到 Vercel 平台。你也可以在项目通过 .env 提供云厂商的 ak 信息。

```bash

$ yarn deploy           # 部署到测试环境
$ yarn deploy:test      # 部署到测试环境
$ yarn deploy:pre       # 部署到预发环境
$ yarn deploy:prod      # 部署到线上环境

```

## 关于 Malagu Framework

Malagu 是基于 TypeScript 的 Serverless First、组件化、平台无关的渐进式应用框架。


### 特征

- 约定大于配置，零配置，开箱即用
- TypeScript 版 Spring Boot
- Serverless First
- 平台不锁定
- 支持前后端一体化，前端框架不锁定
- 支持微服务
- 组件化，渐进式
- 命令行工具插件化
- 依赖注入
- 面向切面编程（AOP）
- 集成了流行的 ORM 框架，使用装饰器声明式事务管理
- 支持 OIDC 认证
- 支持 OAuth2 授权
- 使用 rxjs 管理状态
- 提供 REST 和 RPC 两种接口风格

Malagu 名字由来：在我的家乡，谐音“吗啦咕”是小石头的意思，小石头堆砌起来可以建成高楼大厦、道路桥梁，而 Malagu 组件编排可以实现千变万化的应用。

### 快速开始

```bash
# 安装命令行工具
npm install -g yarn
npm install -g @malagu/cli

# 初始化
malagu init project-name
cd project-name            # 进入项目根目录

# 运行
malagu serve

# 部署
malagu deploy
```

### 文档

- [介绍](https://www.yuque.com/cellbang/malagu/puw7p0)
- [快速开始](https://www.yuque.com/cellbang/malagu/qmq79k)
- [命令行工具](https://www.yuque.com/cellbang/malagu/xbfpir)
- [控制器](https://www.yuque.com/cellbang/malagu/cbgl7g)
- [数据库操作](https://www.yuque.com/cellbang/malagu/ztbcwq)
- [微服务](https://www.yuque.com/cellbang/malagu/wtiy6s)
- [认证与授权](https://www.yuque.com/cellbang/malagu/qhl0km)
- [云平台适配](https://www.yuque.com/cellbang/malagu/hh1mng)
- [依赖注入](https://www.yuque.com/cellbang/malagu/fw025h)
- [组件设计](https://www.yuque.com/cellbang/malagu/qaqomw)
- [前端架构](https://www.yuque.com/cellbang/malagu/vl9wbw)
- [React 开发](https://www.yuque.com/cellbang/malagu/fum7u8)
- [前后端一体化开发](https://www.yuque.com/cellbang/malagu/fi6lxi)

