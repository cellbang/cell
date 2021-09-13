[English](./README.md) | 简体中文

![Malagu Logo](https://cellbang-lib.oss-cn-hangzhou.aliyuncs.com/Malagu%20Logo%20Green.svg?Expires=1631577690&OSSAccessKeyId=TMP.3Khb7eYKhroxuo5ccz1ksxvv4ftMBha1oQrKsJissh97kHbSxQU7i4KYCNee82JgmDmyyhZzrczY189QZ4UMgYxwMHTMXj&Signature=H2Bc1grlec9ro%2Bz0cXnUxAJJNug%3D) 
# [Malagu](https://www.yuque.com/cellbang/malagu/puw7p0) 

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/cellbang/malagu/blob/master/LICENSE)
[![npm version](https://img.shields.io/npm/v/@malagu/core.svg?style=flat)](https://www.npmjs.com/org/malagu)
[![npm downloads](https://img.shields.io/npm/dm/@malagu/core.svg?style=flat)](https://www.npmjs.com/org/malagu)
[![Build Status](https://github.com/cellbang/malagu/workflows/Build/badge.svg?branch=master)](https://github.com/cellbang/malagu/actions?query=branch%3Amaster+event%3Apush+event%3Aschedule)

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

![Quick start](https://cellbang-lib.oss-cn-hangzhou.aliyuncs.com/Malagu%20%E5%BF%AB%E9%80%9F%E5%BC%80%E5%A7%8B.gif)

## 示例

[在线示例模板查看](https://cloud.cellbang.com/?share=2b89fe47-0208-43da-94e1-ded64ddd51fd#/templates)

## 文档

- [介绍](https://www.yuque.com/cellbang/malagu/puw7p0)
- [创建第一个应用](https://www.yuque.com/cellbang/malagu/ogreg3)
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
