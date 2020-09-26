# 开发说明

以下使用 yarn 工具来说明，你也可以使用 npm。

## 安装依赖

```shell
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

模板默认提供了四套隔离环境：本地（local）、测试（test）、预发（pre）、线上（prod）。每个环境对于这一个 malagu 配置文件，类似 malagu-test.yml。而 malagu.yml 文件一般用于放所有环境的公共配置。如果你不需要这么多得环境隔离，删掉相关的配置文件即可。第一次部署的时候可能会提示你填写相关云厂商 ak 信息。如果是 Vercel 云平台的模板，会提示你需要登录到 Vercel 平台。你也可以在项目通过 .env 提供云厂商的 ak 信息。

```shell

$ yarn deploy           # 部署到测试环境
$ yarn deploy:test      # 部署到测试环境
$ yarn deploy:pre       # 部署到预发环境
$ yarn deploy:prod      # 部署到线上环境

```

## 关于 Malagu Framework

Malagu 是基于 TypeScript 的 Serverless First、可扩展和组件化的应用框架。

**主要特点：**

1. 基于 TypeScript
1. 零配置
1. NodeJs 版 Spring Boot
1. Serverless First
1. 组件化
1. 前后端一体化
1. 面向切面编程（AOP）
1. 集成了 ORM 框架
1. 命令工具插件化
1. 支持适配任意前端框架

**相关链接**

* [框架项目地址](https://github.com/cellbang/malagu)
* [框架详细文档](https://www.yuque.com/cellbang/malagu)
