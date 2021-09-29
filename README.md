English | [简体中文](./README.zh-cn.md)

![Malagu Logo](https://cellbang-lib.oss-cn-hangzhou.aliyuncs.com/Malagu%20Logo%20Green.svg) 
# [Malagu](https://www.yuque.com/cellbang/malagu/puw7p0)

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/cellbang/malagu/blob/master/LICENSE)
[![npm version](https://img.shields.io/npm/v/@malagu/core.svg?style=flat)](https://www.npmjs.com/org/malagu)
[![npm downloads](https://img.shields.io/npm/dm/@malagu/core.svg?style=flat)](https://www.npmjs.com/org/malagu)
[![Build Status](https://github.com/cellbang/malagu/workflows/Build/badge.svg?branch=master)](https://github.com/cellbang/malagu/actions?query=branch%3Amaster+event%3Apush+event%3Aschedule)

Malagu is a Serverless First, componentized, platform-independent progressive application framework based on TypeScript.

## Features

- Convention is greater than configuration, zero configuration, ready to use out of the box
- Spring Boot for TypeScript
- Serverless First
- The platform is not locked
- Support front-end and back-end integration, and the front-end frame is not locked
- Support microservices
- Componentization, progressive
- Pluginization of command line tools
- Dependency injection
- Aspect Oriented Programming (AOP)
- Integrate with popular ORM framework and use decorator declarative transaction management
- Support OIDC certification
- Support OAuth2 authorization
- Use rxjs to manage status
- Provides two interface styles, REST and RPC

The origin of Malagu's name: In my hometown, the homophonic "Ma Lagu" means small stones. The small stones can be piled up to build high-rise buildings, roads and bridges, and the arrangement of Malagu components can realize ever-changing applications.

## Quick start

```bash
# Install command-line tools
npm install -g @malagu/cli

# Initialization
malagu init project-name
cd project-name # Enter the project root directory

# Running
malagu serve

# Deployment
malagu deploy
```

![Quick start](https://cellbang-lib.oss-cn-hangzhou.aliyuncs.com/Malagu%20%E5%BF%AB%E9%80%9F%E5%BC%80%E5%A7%8B.gif)

## Example

[View Online Sample Template](https://cloud.cellbang.com/?share=2b89fe47-0208-43da-94e1-ded64ddd51fd#/templates)

## Documentation

- [Introduction](https://www.yuque.com/cellbang/malagu/puw7p0)
- [Create the first application](https://www.yuque.com/cellbang/malagu/ogreg3)
- [Command line tools](https://www.yuque.com/cellbang/malagu/xbfpir)
- [Controller](https://www.yuque.com/cellbang/malagu/cbgl7g)
- [Database operations](https://www.yuque.com/cellbang/malagu/ztbcwq)
- [Microservice](https://www.yuque.com/cellbang/malagu/wtiy6s)
- [Authentication and authorization](https://www.yuque.com/cellbang/malagu/qhl0km)
- [Cloud Platform Adaptation](https://www.yuque.com/cellbang/malagu/hh1mng)
- [Dependency injection](https://www.yuque.com/cellbang/malagu/fw025h)
- [Component design](https://www.yuque.com/cellbang/malagu/qaqomw)
- [Front-end architecture](https://www.yuque.com/cellbang/malagu/vl9wbw)
- [React development](https://www.yuque.com/cellbang/malagu/fum7u8)
- [Front and back-end integrated development](https://www.yuque.com/cellbang/malagu/fi6lxi)


## Dependency injection

```typescript
// Class object injection
@Component()
export class A {

}

@Component()
export class B {
    @Autowired()
    protected a: A;
}

// Configuration property injection
@Component()
export class C {
    @Value('foo') // Support EL expression syntax, such as @Value('obj.xxx'), @Value('arr[1]') etc.
    protected foo: string;
}
```

## Database operations

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

## Discuss group

![群二维码.png](https://cellbang-lib.oss-cn-hangzhou.aliyuncs.com/%E7%BE%A4%E4%BA%8C%E7%BB%B4%E7%A0%81.png)

