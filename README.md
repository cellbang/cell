# Malagu

Malagu is a serverless First, scalable and componentized application framework developed by TypeScript.

*Read this in other languages: [简体中文](README.zh-cn.md)*

**Features**

1. Based on TypeScript
1. Zero configuration
1. Spring Boot-like development experience
1. Serverless First
1. componentization
1. Front-end and back-end integration
1. Aspect-oriented programming (AOP)
1. Integrated ORM framework
1. The command tool is extensible

The origin of the name Malagu: In my hometown, the homonym "Malagu" means small stones. Stacked small stones can be used to build high-rise buildings, roads and bridges, and Malagu component arrangement can realize a variety of applications.

## Document

To check out the [document](https://www.yuque.com/cellbang/malagu).

## Changelog

Detailed changes for each release are documented in the [release notes](https://github.com/cellbang/malagu/releases).

## Quick Start

1. Create an application

![](https://img.alicdn.com/tfs/TB1BjYFcIKfxu4jSZPfXXb3dXXa-1425-818.gif)

2. Run locally

![](https://gw.alicdn.com/tfs/TB1Vb1rA.Y1gK0jSZFCXXcwqXXa-1425-818.gif)

3. Debug locally

![](https://img.alicdn.com/tfs/TB1j5KtAYj1gK0jSZFuXXcrHpXa-1425-818.gif)

4. Deploy the application

![](https://img.alicdn.com/tfs/TB1SbCnA4z1gK0jSZSgXXavwpXa-1425-818.gif)


## Dependency injection

```typescript
@Component()
export class A {

}

@Component()
export class B {
    @Autowired()
    protected a: A;
}
```

## Property injection

```typescript
@Component()
export class A {
    @Value('foo') // Support EL expression syntax, such as @Value ('obj.xxx'), @Value ('arr [1]'), etc.
    protected foo: string;
}
```

## MVC

```typescript
@Controller('users')
export class UserController {
    
    @Get()
    list(): Promise<User[]> {
        ...
    }

    @Get(':id')
    get(@Param('id') id: number): Promise<User | undefined> {
        ...
    }

    @Delete(':id')
    async remove(@Param('id') id: number): Promise<void> {
        ...
    }

    @Put()
    async modify(@Body() user: User): Promise<void> {
        ...
    }

    @Post()
    create(@Body() user: User): Promise<User> {
        ...
    }

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
