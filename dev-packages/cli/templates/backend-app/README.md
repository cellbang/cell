# 开发说明

## 安装依赖

以下使用 yarn 工具来说明，你也可以使用 npm。

```bash
# 通过 malagu init 初始化应用的时候已经自动安装了依赖，所以你只需要安装你额外需要的依赖即可

$ yarn add xxxx
```

## 本地运行

```bash
# 启动本地服务，端口默认 3000
# 在终端中会输出本地服务的 URL 链接

$ yarn start  # 或者执行 malagu serve 命令
```

## 构建部署

模板默认提供了四套隔离环境：本地（local）、测试（test）、预发（pre）、线上（prod）。每个环境对应着一个 malagu 配置文件（可选），类似 malagu-test.yml。而 malagu.yml 文件一般用于放所有环境的公共配置。第一次部署的时候可能会提示你填写相关云厂商 ak 信息。如果是 Vercel 云平台的模板，会提示你需要登录到 Vercel 平台。你也可以在项目通过 .env 提供云厂商的 ak 信息。

```bash

$ malagu deploy -m scf            # 部署到腾讯云函数测试环境
$ malagu deploy -m scf -m test    # 部署到腾讯云测试环境
$ malagu deploy -m scf -m pre     # 部署到腾讯云预发环境
$ malagu deploy -m scf -m prod    # 部署到腾讯云线上环境

```

## 关于 Malagu Framework

Malagu 是基于 TypeScript 的 Serverless First、组件化、平台无关的渐进式应用框架。

## 特征

-   约定大于配置，零配置，开箱即用
-   TypeScript 版 Spring Boot
-   Serverless First
-   平台不锁定
-   支持前后端一体化，前端框架不锁定
-   支持微服务
-   组件化，渐进式
-   命令行工具插件化
-   依赖注入
-   面向切面编程（AOP）
-   集成了流行的 ORM 框架，使用装饰器声明式事务管理
-   支持 OIDC 认证
-   支持 OAuth2 授权
-   使用 rxjs 管理状态
-   提供 REST 和 RPC 两种接口风格

Malagu 名字由来：在我的家乡，谐音“吗啦咕”是小石头的意思，小石头堆砌起来可以建成高楼大厦、道路桥梁，而 Malagu 组件编排可以实现千变万化的应用。

## 快速开始

```bash
# 安装命令行工具
npm install -g @malagu/cli

# 初始化
malagu init -o project-name
cd project-name            # 进入项目根目录

# 运行
malagu serve

# 部署
malagu deploy
```

[![Quick Start](https://asciinema.org/a/474104.svg)](https://asciinema.org/a/474104?speed=2.5&autoplay=1)

### 文档

-   [介绍](https://malagu.cellbang.com/guide/%E4%BB%8B%E7%BB%8D)
-   [创建第一个应用](https://malagu.cellbang.com/guide/%E5%88%9B%E5%BB%BA%E7%AC%AC%E4%B8%80%E4%B8%AA%E5%BA%94%E7%94%A8)
-   [命令行工具](https://malagu.cellbang.com/guide/%E5%91%BD%E4%BB%A4%E8%A1%8C%E5%B7%A5%E5%85%B7)
-   [控制器](https://malagu.cellbang.com/guide/%E6%8E%A7%E5%88%B6%E5%99%A8)
-   [数据库操作](https://malagu.cellbang.com/guide/%E6%95%B0%E6%8D%AE%E5%BA%93typeorm)
-   [微服务](https://malagu.cellbang.com/dev/%E5%BE%AE%E6%9C%8D%E5%8A%A1)
-   [认证与授权](https://malagu.cellbang.com/guide/%E8%AE%A4%E8%AF%81%E4%B8%8E%E6%8E%88%E6%9D%83)
-   [云平台适配](https://malagu.cellbang.com/cloud/%E4%BA%91%E5%B9%B3%E5%8F%B0%E9%80%82%E9%85%8D)
-   [依赖注入](https://malagu.cellbang.com/guide/%E4%BE%9D%E8%B5%96%E6%B3%A8%E5%85%A5)
-   [组件设计](https://malagu.cellbang.com/guide/%E7%BB%84%E4%BB%B6%E8%AE%BE%E8%AE%A1)
-   [前端架构](https://malagu.cellbang.com/guide/%E5%89%8D%E7%AB%AF%E6%9E%B6%E6%9E%84)
-   [React 开发](https://malagu.cellbang.com/dev/react)
-   [前后端一体化开发](https://malagu.cellbang.com/dev/%E5%89%8D%E5%90%8E%E7%AB%AF%E4%B8%80%E4%BD%93%E5%8C%96%E5%BC%80%E5%8F%91)
