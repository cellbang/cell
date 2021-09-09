English | [简体中文](./README.zh-cn.md)

![Quick start](https://cdn.nlark.com/yuque/0/2021/svg/365432/1631213735164-4e66c160-84d2-439e-95be-20d337a114b2.svg?date=1631213780270) 
# [Malagu](https://www.yuque.com/cellbang/malagu/puw7p0)

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/cellbang/malagu/blob/master/LICENSE)
[![npm version](https://img.shields.io/npm/v/@malagu/core.svg?style=flat)](https://www.npmjs.com/org/malagu)
[![npm downloads](https://img.shields.io/npm/dm/@malagu/core.svg?style=flat)](https://www.npmjs.com/org/malagu)
[![TravisCI](https://www.travis-ci.org/cellbang/malagu.svg?branch=master)](https://www.travis-ci.org/cellbang/malagu) 

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

![Quick start](https://cdn.nlark.com/yuque/0/2021/gif/365432/1631211054396-6fbedbd4-b57a-4d80-bdc3-7136bc9bf8c4.gif?date=1631211077631)

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

![群二维码.png](https://cdn.nlark.com/yuque/0/2020/png/365432/1606829901447-499234ed-58f0-4c60-8760-735f8e7feac8.png#align=left&display=inline&height=461&margin=%5Bobject%20Object%5D&name=%E7%BE%A4%E4%BA%8C%E7%BB%B4%E7%A0%81.png&originHeight=461&originWidth=722&size=167559&status=done&style=none&width=722)
