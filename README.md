English | [简体中文](./README.zh-cn.md)

# [Malagu](https://www.yuque.com/cellbang/malagu/puw7p0)

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/cellbang/malagu/blob/master/LICENSE)
[![npm version](https://img.shields.io/npm/v/@malagu/core.svg?style=flat)](https://www.npmjs.com/org/malagu)
[![npm downloads](https://img.shields.io/npm/dm/@malagu/core.svg?style=flat)](https://www.npmjs.com/org/malagu)
[![TravisCI](https://www.travis-ci.org/cellbang/malagu.svg?branch=master)](https://www.travis-ci.org/cellbang/malagu) 

Malagu is a Serverless First, component-based, platform-independent, progressive application framework based on TypeScript.


## Features

- Convention over configuration, zero configuration, out of the box
- Spring Boot for TypeScript
- Serverless First
- The platform is not locked.
- Support for front-end integration, front-end framework is not locked
- Componentized, Progressive
- Plug-in command line tools
- Dependency injection
- Facet-oriented programming (AOP)
- Integrates with the popular ORM framework for declarative transaction management using decorators.
- Support for OIDC accreditation
- OAuth2 authorization support
- Managing Status with rxjs
- Both REST and RPC interface styles available

The Malagu name comes from the fact that where I come from, the word "malagu" means small stone, and while small stones can be built into tall buildings, roads, and bridges, the Malagu component layout can be used in a myriad of ways.

## Quick start

```bash
# Install command-line tools
npm install -g yarn
npm install -g @malagu/cli

# Initialization
malagu init project-name
cd project-name # Enter the project root directory

# Running
malagu serve

# Deployment
malagu deploy
```

## Documentation

- [Introduction](https://www.yuque.com/cellbang/malagu/puw7p0)
- [Quick Start](https://www.yuque.com/cellbang/malagu/qmq79k)
- [Command line tools](https://www.yuque.com/cellbang/malagu/xbfpir)
- [Controller](https://www.yuque.com/cellbang/malagu/cbgl7g)
- [Database operations](https://www.yuque.com/cellbang/malagu/ztbcwq)
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

<img src="https://i.loli.net/2020/09/29/omaq25b9VtSLI6X.jpg" width="260px"/><img src="https://i.loli.net/2020/09/29/3gDijlqfF8UP79b.jpg" width="260px" height="343px">
