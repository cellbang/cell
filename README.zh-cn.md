[English](./README.md) | 简体中文


![Malagu Logo](https://cellbang-lib.oss-cn-hangzhou.aliyuncs.com/Malagu%20Logo%20Green.svg) 

# [Malagu](https://malagu.cellbang.com/) 

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/cellbang/malagu/blob/master/LICENSE)
[![npm version](https://img.shields.io/npm/v/@malagu/core.svg?style=flat)](https://www.npmjs.com/org/malagu)
[![npm downloads](https://img.shields.io/npm/dm/@malagu/core.svg?style=flat)](https://www.npmjs.com/org/malagu)
[![Build Status](https://github.com/cellbang/malagu/workflows/Build/badge.svg?branch=master)](https://github.com/cellbang/malagu/actions?query=branch%3Amaster+event%3Apush+event%3Aschedule)

[![Cloud Studio Template](https://cs-res.codehub.cn/common/assets/icon-badge.svg)](https://cloudstudio.net/templates/edrZ4u5se8)

Malagu 是基于 TypeScript 的 Serverless First、组件化、平台无关的渐进式应用框架。


## 特征

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

## 快速开始

```bash
# 安装命令行工具
npm install -g @malagu/cli

# 初始化
malagu init project-name
cd project-name            # 进入项目根目录

# 运行
malagu serve

# 部署
malagu deploy
```

[![Quick Start](https://asciinema.org/a/474104.svg)](https://asciinema.org/a/474104)

## 示例

- [Backend 示例](https://cloudstudio.net/templates/5QnU8uuBCE)
- [React 示例](https://cloudstudio.net/templates/5QWIO8Jazj)
- [Vue 示例](https://cloudstudio.net/templates/5QuWSgAul5)
- [Shedule 示例](https://cloudstudio.net/templates/5BfaTPi5n5)
- [Microservice 示例](https://cloudstudio.net/templates/5QxzzZvxvx)
- [Accounts 示例](https://cloudstudio.net/templates/5QOrLlMcV6)

## 文档

- [介绍](https://malagu.cellbang.com/guide/%E4%BB%8B%E7%BB%8D)
- [创建第一个应用](https://malagu.cellbang.com/guide/%E5%88%9B%E5%BB%BA%E7%AC%AC%E4%B8%80%E4%B8%AA%E5%BA%94%E7%94%A8)
- [命令行工具](https://malagu.cellbang.com/guide/%E5%91%BD%E4%BB%A4%E8%A1%8C%E5%B7%A5%E5%85%B7)
- [控制器](https://malagu.cellbang.com/guide/%E6%8E%A7%E5%88%B6%E5%99%A8)
- [数据库操作](https://malagu.cellbang.com/guide/%E6%95%B0%E6%8D%AE%E5%BA%93typeorm)
- [微服务](https://malagu.cellbang.com/dev/%E5%BE%AE%E6%9C%8D%E5%8A%A1)
- [认证与授权](https://malagu.cellbang.com/guide/%E8%AE%A4%E8%AF%81%E4%B8%8E%E6%8E%88%E6%9D%83)
- [云平台适配](https://malagu.cellbang.com/cloud/%E4%BA%91%E5%B9%B3%E5%8F%B0%E9%80%82%E9%85%8D)
- [依赖注入](https://malagu.cellbang.com/guide/%E4%BE%9D%E8%B5%96%E6%B3%A8%E5%85%A5)
- [组件设计](https://malagu.cellbang.com/guide/%E7%BB%84%E4%BB%B6%E8%AE%BE%E8%AE%A1)
- [前端架构](https://malagu.cellbang.com/guide/%E5%89%8D%E7%AB%AF%E6%9E%B6%E6%9E%84)
- [React 开发](https://malagu.cellbang.com/dev/react)
- [前后端一体化开发](https://malagu.cellbang.com/dev/%E5%89%8D%E5%90%8E%E7%AB%AF%E4%B8%80%E4%BD%93%E5%8C%96%E5%BC%80%E5%8F%91)


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
import { Controller, Get, Param, Delete, Put, Post, Body } from '@malagu/mvc/lib/node';
import { Transactional, OrmContext } from '@malagu/typeorm/lib/node';
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
