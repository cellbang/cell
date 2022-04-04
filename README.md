English | [简体中文](./README.zh-cn.md)

![Malagu Logo](https://cellbang-lib.oss-cn-hangzhou.aliyuncs.com/Malagu%20Logo%20Green.svg) 
# [Malagu](https://malagu.cellbang.com/) 

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/cellbang/malagu/blob/master/LICENSE)
[![npm version](https://img.shields.io/npm/v/@malagu/core.svg?style=flat)](https://www.npmjs.com/org/malagu)
[![npm downloads](https://img.shields.io/npm/dm/@malagu/core.svg?style=flat)](https://www.npmjs.com/org/malagu)
[![Build Status](https://github.com/cellbang/malagu/workflows/Build/badge.svg?branch=master)](https://github.com/cellbang/malagu/actions?query=branch%3Amaster+event%3Apush+event%3Aschedule)

[![Cloud Studio Template](https://cs-res.codehub.cn/common/assets/icon-badge.svg)](https://cloudstudio.net/templates/edrZ4u5se8)

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
[![Quick Start](https://asciinema.org/a/474104.svg)](https://asciinema.org/a/474104?speed=2.5&autoplay=1)

## Samples

- [Backend Sample](https://cloudstudio.net/templates/5QnU8uuBCE)
- [React Sample](https://cloudstudio.net/templates/5QWIO8Jazj)
- [Vue Sample](https://cloudstudio.net/templates/5QuWSgAul5)
- [Shedule Sample](https://cloudstudio.net/templates/5BfaTPi5n5)
- [Microservice Sample](https://cloudstudio.net/templates/5QxzzZvxvx)
- [Accounts Sample](https://cloudstudio.net/templates/5QOrLlMcV6)

## Documentation

- [Introduction](https://malagu.cellbang.com/guide/%E4%BB%8B%E7%BB%8D)
- [Create the first application](https://malagu.cellbang.com/guide/%E5%88%9B%E5%BB%BA%E7%AC%AC%E4%B8%80%E4%B8%AA%E5%BA%94%E7%94%A8)
- [Command line tools](https://malagu.cellbang.com/guide/%E5%91%BD%E4%BB%A4%E8%A1%8C%E5%B7%A5%E5%85%B7)
- [Controller](https://malagu.cellbang.com/guide/%E6%8E%A7%E5%88%B6%E5%99%A8)
- [Database operations](https://malagu.cellbang.com/guide/%E6%95%B0%E6%8D%AE%E5%BA%93typeorm)
- [Microservice](https://malagu.cellbang.com/dev/%E5%BE%AE%E6%9C%8D%E5%8A%A1)
- [Authentication and authorization](https://malagu.cellbang.com/guide/%E8%AE%A4%E8%AF%81%E4%B8%8E%E6%8E%88%E6%9D%83)
- [Cloud Platform Adaptation](https://malagu.cellbang.com/cloud/%E4%BA%91%E5%B9%B3%E5%8F%B0%E9%80%82%E9%85%8D)
- [Dependency injection](https://malagu.cellbang.com/guide/%E4%BE%9D%E8%B5%96%E6%B3%A8%E5%85%A5)
- [Component design](https://malagu.cellbang.com/guide/%E7%BB%84%E4%BB%B6%E8%AE%BE%E8%AE%A1)
- [Front-end architecture](https://malagu.cellbang.com/guide/%E5%89%8D%E7%AB%AF%E6%9E%B6%E6%9E%84)
- [React development](https://malagu.cellbang.com/dev/react)
- [Front and back-end integrated development](https://malagu.cellbang.com/dev/%E5%89%8D%E5%90%8E%E7%AB%AF%E4%B8%80%E4%BD%93%E5%8C%96%E5%BC%80%E5%8F%91)


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

## Status
![Alt](https://repobeats.axiom.co/api/embed/59b39c98717cf1ae18b57f24d2efe91617e3a6f1.svg "Repobeats analytics image")

