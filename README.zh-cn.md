[English](./README.md) | 简体中文

![Cell Logo](https://cellbang-lib.oss-cn-hangzhou.aliyuncs.com/Cell%20Logo%20Green.svg) 

# [Cell](https://malagu.cellbang.com/) 

[![GitHub License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/cellbang/cell/blob/master/LICENSE)
[![npm Version](https://img.shields.io/npm/v/@celljs/core.svg?style=flat)](https://www.npmjs.com/org/celljs)
[![npm Downloads](https://img.shields.io/npm/dm/@celljs/core.svg?style=flat)](https://www.npmjs.com/org/celljs)
[![Build Status](https://github.com/cellbang/cell/actions/workflows/build.yml/badge.svg?branch=main)](https://github.com/cellbang/cell/actions?query=branch%3Amain+event%3Apush+event%3Aschedule)
[![Stars](https://gitee.com/cellbang/malagu/badge/star.svg?theme=dark)](https://gitee.com/cellbang/malagu)

Cell 是基于 TypeScript 的 **Serverless First**、**组件化**、**平台无关**的渐进式应用框架。

## 特点

- **零配置**：开箱即用，减少配置复杂性。
- **基于 TypeScript**：提供强类型支持，提升开发效率。
- **AI 支持**：提供了 AI 基础抽象和多厂商模型服务接口适配。
- **无服务器优先**：优化 Serverless 应用开发。
- **跨平台**：不依赖具体平台，灵活部署。
- **全栈支持**：前后端一体化，兼容多种前端框架。
- **微服务架构**：支持构建和管理微服务。
- **组件化**：模块化设计，便于扩展和维护。
- **插件化工具**：命令行工具支持插件，增强功能。
- **依赖注入**：简化组件之间的依赖管理。
- **面向切面编程 (AOP)**：实现横切关注点的模块化。
- **集成 ORM**：使用装饰器进行事务管理，简化数据库操作。
- **认证与授权**：支持 OIDC 认证和 OAuth2 授权。
- **状态管理**：采用 rxjs 管理应用状态。
- **多接口风格**：同时支持 REST 和 RPC 接口。

## 快速开始

```bash
# 安装命令行工具
npm install -g @celljs/cli

# 初始化项目
cell init -o project-name
cd project-name            # 进入项目根目录

# 运行项目
cell serve

# 部署项目
cell deploy -m scf      # 部署到腾讯云云函数（SCF）
cell deploy -m fc       # 部署到阿里云函数计算（FC）
cell deploy -m lambda   # 部署到 AWS Lambda
```

[![Quick Start](https://asciinema.org/a/474104.svg)](https://asciinema.org/a/474104?speed=2.5&autoplay=1)

## 示例

- [Backend 示例](https://cloudstudio.net/templates/5QnU8uuBCE)
- [React 示例](https://cloudstudio.net/templates/5QWIO8Jazj)
- [Vue 示例](https://cloudstudio.net/templates/5QuWSgAul5)
- [Shedule 示例](https://cloudstudio.net/templates/5BfaTPi5n5)
- [Microservice 示例](https://cloudstudio.net/templates/5QxzzZvxvx)
- [Accounts 示例](https://cloudstudio.net/templates/5QOrLlMcV6)

## 文档

- [介绍](https://cell.cellbang.com/guide/%E4%BB%8B%E7%BB%8D)
- [创建第一个应用](https://cell.cellbang.com/guide/%E5%88%9B%E5%BB%BA%E7%AC%AC%E4%B8%80%E4%B8%AA%E5%BA%94%E7%94%A8)
- [命令行工具](https://cell.cellbang.com/guide/%E5%91%BD%E4%BB%A4%E8%A1%8C%E5%B7%A5%E5%85%B7)
- [控制器](https://cell.cellbang.com/guide/%E6%8E%A7%E5%88%B6%E5%99%A8)
- [数据库操作](https://cell.cellbang.com/guide/%E6%95%B0%E6%8D%AE%E5%BA%93typeorm)
- [微服务](https://cell.cellbang.com/dev/%E5%BE%AE%E6%9C%8D%E5%8A%A1)
- [认证与授权](https://cell.cellbang.com/guide/%E8%AE%A4%E8%AF%81%E4%B8%8E%E6%8E%88%E6%9D%83)
- [云平台适配](https://cell.cellbang.com/cloud/%E4%BA%91%E5%B9%B3%E5%8F%B0%E9%80%82%E9%85%8D)
- [依赖注入](https://cell.cellbang.com/guide/%E4%BE%9D%E8%B5%96%E6%B3%A8%E5%85%A5)
- [组件设计](https://cell.cellbang.com/guide/%E7%BB%84%E4%BB%B6%E8%AE%BE%E8%AE%A1)
- [前端架构](https://cell.cellbang.com/guide/%E5%89%8D%E7%AB%AF%E6%9E%B6%E6%9E%84)
- [React 开发](https://cell.cellbang.com/dev/react)
- [前后端一体化开发](https://cell.cellbang.com/dev/%E5%89%8D%E5%90%8E%E7%AB%AF%E4%B8%80%E4%BD%93%E5%8C%96%E5%BC%80%E5%8F%91)


## 依赖注入

```typescript
// 类对象注入
@Component()
export class A {

}

@Component()
export class B {
    @Autowired()
    protected a: A;
}

// 配置属性注入
@Component()
export class C {
    @Value('foo') // 支持 EL 表达式语法，如 @Value('obj.xxx')、@Value('arr[1]') 等等
    protected foo: string;
}
```

## 数据库操作

```typescript
import { Controller, Get, Param, Delete, Put, Post, Body } from '@celljs/mvc/lib/node';
import { Transactional, OrmContext } from '@celljs/typeorm/lib/node';
import { User } from './entity';
@Controller('users')
export class UserController {
    
    @Get()
    @Transactional({ readOnly: true })
    list(): Promise<User[]> {
        const repo = OrmContext.getRepository(User);
        return repo.find();
    }
    @Get(':id')
    @Transactional({ readOnly: true })
    get(@Param('id') id: number): Promise<User | undefined> {
        const repo = OrmContext.getRepository(User);
        return repo.findOne(id);
    }
    @Delete(':id')
    @Transactional()
    async remove(@Param('id') id: number): Promise<void> {
        const repo = OrmContext.getRepository(User);
        await repo.delete(id);
    }
    @Put()
    @Transactional()
    async modify(@Body() user: User): Promise<void> {
        const repo = OrmContext.getRepository(User);
        await repo.update(user.id, user);
    }
    @Post()
    @Transactional()
    create(@Body() user: User): Promise<User> {
        const repo = OrmContext.getRepository(User);
        return repo.save(user);
    }
}
```

## 交流群

![群二维码.png](https://cellbang-lib.oss-cn-hangzhou.aliyuncs.com/%E7%BE%A4%E4%BA%8C%E7%BB%B4%E7%A0%81.png)

## 状态
![Alt](https://repobeats.axiom.co/api/embed/59b39c98717cf1ae18b57f24d2efe91617e3a6f1.svg "Repobeats analytics image")
