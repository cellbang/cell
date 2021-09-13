[English](./README.md) | 简体中文

![Quick start](https://cdn.nlark.com/yuque/0/2021/svg/365432/1631213735164-4e66c160-84d2-439e-95be-20d337a114b2.svg?date=1631213780270) 
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

![Quick start](https://cdn.nlark.com/yuque/0/2021/gif/365432/1631211054396-6fbedbd4-b57a-4d80-bdc3-7136bc9bf8c4.gif?date=1631211077631)

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

![群二维码.png](https://cdn.nlark.com/yuque/0/2020/png/365432/1606829901447-499234ed-58f0-4c60-8760-735f8e7feac8.png#align=left&display=inline&height=461&margin=%5Bobject%20Object%5D&name=%E7%BE%A4%E4%BA%8C%E7%BB%B4%E7%A0%81.png&originHeight=461&originWidth=722&size=167559&status=done&style=none&width=722)

<!-- ## 示例

1. 创建应用

![](https://img.alicdn.com/tfs/TB1BjYFcIKfxu4jSZPfXXb3dXXa-1425-818.gif)

2. 本地运行应用

![](https://gw.alicdn.com/tfs/TB1Vb1rA.Y1gK0jSZFCXXcwqXXa-1425-818.gif)

3. 本地调试应用

![](https://img.alicdn.com/tfs/TB1j5KtAYj1gK0jSZFuXXcrHpXa-1425-818.gif)

4. 部署应用

![](https://img.alicdn.com/tfs/TB1SbCnA4z1gK0jSZSgXXavwpXa-1425-818.gif) -->
