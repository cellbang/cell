# Cell - Core Component

## 概览

Cell 核心组件是一个轻量级的应用框架，用于构建现代化的应用程序。通过依赖注入、AOP 面向切面编程、配置属性、日志等功能，提供了一套简单易用的 API 接口，支持类对象的注册、解析和生命周期管理。Cell 核心组件是基于 [InversifyJS](https://github.com/inversify/InversifyJS) 构建的，支持 TypeScript 语言。

## 特性

- 依赖注入
- 面向切面编程
- 配置属性
- 日志

## 安装

使用 npm 安装 Cell 核心组件：

```bash
npm install @celljs/core
```

或者使用 yarn：

```bash
yarn add @celljs/core
```

## 快速开始

以下是一个简单的依赖注入示例，展示如何使用 Cell 核心组件将一个类对象注入到 IoC 容器中：

```typescript
import { Component } from '@celljs/core';

@Component()
export class HelloWorld {
    greet() {
        return 'Hello, World!';
    }
}
```


然后，在另一个对象中使用 `@Autowired` 注解来注入 `HelloWorld` 类对象：

```typescript
import { Autowired, ApplicationFactory } from '@celljs/core';
import { HelloWorld } from './hello-world';

export class SampleService {
    @Autowired()
    helloWorld: HelloWorld;

    run() {
        console.log(this.helloWorld.greet());
    }
}
```

接着，在 IoC 容器模块中注册 `HelloWorld` 和 `SampleService` 类对象：

```typescript
import { ApplicationFactory } from '@celljs/core';
import { HelloWorld } from './hello-world';
import { SampleService } from './sample-service';

export const SampleModule = autoBind();
```

最后，通过 `ApplicationFactory` 创建应用实例，加载 IoC 容器模块，组装成一个完整的 IoC 容器：

```typescript
import { ApplicationFactory } from '@celljs/core';
import { SampleService } from './sample-service';
import { SampleModule } from './sample-module';

(async () => {
    const appProps = {};
    const app = await ApplicationFactory.create(appProps, SampleModule);
    app.start();
})();

```

## 依赖注入

Cell 核心组件提供了依赖注入功能，支持将类对象注入到 IoC 容器中，并在其他类对象中使用 `@Autowired` 注解来注入依赖对象。以下是一个简单的依赖注入示例：

```typescript
import { Component, Autowired } from '@celljs/core';

@Component()
export class HelloWorld {
    greet() {
        return 'Hello, World!';
    }
}

@Component()
export class SampleService {
    @Autowired()
    helloWorld: HelloWorld;

    run() {
        console.log(this.helloWorld.greet());
    }
}
```

## 属性注入

Cell 核心组件支持属性注入功能，通过 `@Value` 注解可以将配置属性注入到类对象中。以下是一个简单的属性注入示例：

```typescript
import { Component, Value } from '@celljs/core';

@Component()
export class SampleService {
    @Value('app.name')
    appName: string;

    run() {
        console.log(`App Name: ${this.appName}`);
    }
}
```

可以被注入的属性是在应用启动时通过 `ApplicationFactory` 的 `create` 方法传入的 `appProps` 对象中定义的。例如：

```typescript
import { ApplicationFactory } from '@celljs/core';
import { SampleService } from './sample-service';

(async () => {
    const appProps = {
        app: { name: 'MyApp' }
    };
    const app = await ApplicationFactory.create(appProps, SampleModule);
    app.start();
})();
```

属性注入时，可以使用 `.` 来访问嵌套属性，例如 `@Value('app.name')`。

除此之外，`@Value` 的字符串才是支持 EL 表达式的，底层是基于 [jexl](https://github.com/TomFrost/jexl) 实现的。例如：

```typescript
import { Component, Value } from '@celljs/core';

@Component()
export class SampleService {

    // 对象访问
    @Value('app.name')
    appName: string;

    // 三元表达式
    @Value('app.name == "MyApp" ? "Hello, MyApp!" : "Hello, World!"')
    greeting: string; 
    
    // 提供默认值
    @Value('app.version ?: "1.0.0"')
    appVersion: string;

    // 数学运算
    @Value('app.port + 1')
    port: number;

    // 逻辑运算
    @Value('app.debug && app.env == "dev"')
    debug: boolean;

    // 数组访问
    @Value('app.tags[0]')
    tag: string;

    // 数组过滤
    @Value('employees[.age >= 30 && .age < 40]')
    middleAgedEmployees: Employee[];

    // 变换
    // 假如定义如下两个变换：
    // jexl.addTransform('split', (val, char) => val.split(char))
    // jexl.addTransform('lower', (val) => val.toLowerCase())
    @Value('"Pam Poovey"|lower|split(' ')[1]')
    lastName: string;

    // 函数调用
    // 假如定义如下函数：
    // jexl.addFunction('min', Math.min)
    @Value('min(3, 5)')
    min: number;
    
}
```

## IoC 容器

Cell 核心组件提供了一个轻量级的 IoC 容器，用于管理类对象的生命周期和依赖关系。通过 `@Component` 注解可以将类对象注册到 IoC 容器中，通过 `@Autowired` 注解可以在其他类对象中注入依赖对象。

IoC 容器底层实现是基于 [InversifyJS](https://github.com/inversify/InversifyJS) 的，提供了一套简单易用的 API 接口，支持类对象的注册、解析和生命周期管理。借鉴 Spring Framework 的设计理念，提供了一套类似 Spring 的装饰器，例如 `@Component`、`@Autowired`、`@Value` 等。

IoC 容器是由一些列容器模块组成的，每个容器模块是由一些类对象组成的，通过 `@Component` 注解注册到容器模块。为了方便注册类对象到容器模块中，Cell 核心组件提供了 `autoBind` 方法，可以自动注册类对象到容器模块中。`autoBind` 通过文件模块依赖分析，自动注册类对象到容器模块中，无需手动注册。

以下是一个简单的 IoC 容器示例：

```typescript
import { Component, Autowired, ApplicationFactory } from '@celljs/core';

@Component()
export class HelloWorld {
    greet() {
        return 'Hello, World!';
    }
}

@Component()
export class SampleService {
    @Autowired()
    helloWorld: HelloWorld;

    run() {
        console.log(this.helloWorld.greet());
    }
}

export const SampleModule = autoBind();
```

`autoBind` 方法还提供一些列的回调函数，用于自定义注册行为。例如：

```typescript
import { autoBind } from '@celljs/core';

export const SampleModule = autoBind((bind, unbind, isBound, rebind) => {
    bind(HelloWorld).toSelf().inSingletonScope();
    bind(SampleService).toSelf().inSingletonScope();
});
```

Cell 核心组件还提供了 `ContainerFactory`，用于创建 IoC 容器实例。例如：
    
```typescript
import { ContainerFactory } from '@celljs/core';
import { SampleModule } from './sample-module';

(async () => {
    const container = await ContainerFactory.create(SampleModule);
    const sampleService = container.get(SampleService);
    sampleService.run();
})();
```

除了使用 `@Autowired` 装饰器来注入依赖对象，还可以使用 `ContainerUtil` 工具类来手动获取容器中的对象。例如：

```typescript
import { ContainerUtil } from '@celljs/core';
import { SampleService } from './sample-service';

@Component()
export class SampleService {

    run() {
        const helloWorld = ContainerUtil.get(HelloWorld);
        console.log(this.helloWorld.greet());
    }
}
```

注意：`ContainerUtil` 工具类只能容器加载完后才能使用，否则会报错。

## 配置属性

Cell 核心组件提供了配置属性功能，支持将配置属性注入到类对象中。通过 `@Value` 注解可以将配置属性注入到类对象中，支持 EL 表达式。

配置属性是在应用启动时通过 `ApplicationFactory` 的 `create` 方法传入的 `appProps` 对象中定义的。例如：

```typescript
import { ApplicationFactory } from '@celljs/core';
import { SampleService } from './sample-service';

(async () => {
    const appProps = {
        app: { name: 'MyApp' }
    };
    const app = await ApplicationFactory.create(appProps, SampleModule);
    app.start();
})();
```

除此之外，还提供了一个 `ConfigProvider` 接口，用于加载配置文件。Cell 核心组件提供了一个默认实现，开发者也可以自定义实现替换掉默认实现。例如：

```typescript
import { ConfigProvider } from '@celljs/core';

@Component({ id: ConfigProvider, rebind: true })
export class MyConfigProvider implements ConfigProvider {
    get<T>(key: string, defaultValue?: T): T {
        return process.env[key] || defaultValue;
    }
}
```

除了前面介绍的使用 `@Value` 注解来注入配置属性，还可以使用 `ConfigUtil` 工具类来手动获取配置属性。例如：

```typescript
import { ConfigUtil } from '@celljs/core';
import { SampleService } from './sample-service';

@Component()
export class SampleService {

    run() {
        const appName = ConfigUtil.get('app.name');
        console.log(`App Name: ${appName}`);
    }
}
```

## 装饰器

Cell 核心组件提供了一套类似 Spring 的装饰器，用于注册类对象到 IoC 容器中。以下是一些常用的装饰器：

- `@Component`：注册类对象到 IoC 容器中。
- `@Autowired`：注入依赖对象。
- `@Value`：注入配置属性。
- `@PostConstruct`：在类对象初始化后执行。
- `@PreDestroy`：在类对象销毁前执行。
- `@Service`：注册服务对象到 IoC 容器中。是 `@Component` 的别名。
- `@Inject`：注入依赖对象。是 `InversifyJS` 的 `inject` 的别名。
- `@Injectable`：标识类对象是可注入的。是 `InversifyJS` 的 `injectable` 的别名。
- `@Named`：指定注入对象的名称。是 `InversifyJS` 的 `named` 的别名。
- `@Optional`：标识注入对象是可选的。是 `InversifyJS` 的 `optional` 的别名。
- `@Tagged`：标识注入对象是标记的。是 `InversifyJS` 的 `tagged` 的别名。
- `@TargetName`：指定注入对象的名称。是 `InversifyJS` 的 `targetName` 的别名。
- `@Unmanaged`：标识类对象是不受管理的。是 `InversifyJS` 的 `unmanaged` 的别名。
- `@Aspect`：定义切面对象。提供 AOP 编程的能力。
- `@AutowiredProvider`：注入依赖提供者，通过依赖提供者对象，获取一类对象列表，支持排序能力。
- `@Constant`：注册常量对象到 IoC 容器中。
- `@Decorate`：装饰类对象。是 `InversifyJS` 的 `decorate` 的别名。

除此之外，还提供了一些装饰器，用于在非托管类对象中使用（当然，也可以直接使用 `ContainerUtil` 工具类来手动获取容器中的对象），例如在前端的 React 类组件中使用。以下是一些常用的非托管类对象的装饰器：

- `@Autowired`：注入依赖对象。
- `@Value`：注入配置属性。
- `@AutowiredProvider`：注入依赖提供者，通过依赖提供者对象，获取一类对象列表，支持排序能力。

例如：

```tsx
import { Autowired, Value } from '@celljs/core/lib/common/annotation/detached';

export class SampleComponent extends React.Component {

    @Autowired()
    sampleService: SampleService;

    @Value('app.name')
    appName: string;

    render() {
        return <div>{this.appName}</div>;
    }
}
```

## @Component 装饰器

`@Component` 装饰器用于注册类对象到 IoC 容器中。该装饰器有以下属性：

- `id`：类对象的标识符，可以是一个或多个。
- `scope`：类对象的作用域，默认是 `Scope.Singleton`。
- `name`：类对象的名称。
- `tag`：类对象的标签。
- `default`：是否是默认的类对象。当给定的服务标识符有多个绑定可用时，可以通过设置 `default` 属性来指定默认的类对象。当通过服务标识符获取单个对象时，则返回默认对象。
- `when`：一个函数，用于判断是否应该创建该类对象。如果返回 `true`，则创建该类对象；否则不创建。
- `rebind`：是否重新绑定类对象。默认是 `false`。
- `proxy`：是否使用代理类对象。默认是 `false`。当为 `true` 时，可以被 AOP 切面拦截。
- `sysTags`：系统标签，用于标识类对象。在 AOP 切面中，可以通过系统标签来拦截类对象。
- `onActivation`：在类对象激活时执行的回调函数。

例如：

```typescript
import { Component, Scope } from '@celljs/core';

@Component({ id: 'HelloWorld', scope: Scope.Singleton })
export class HelloWorld {
    greet() {
        return 'Hello, World!';
    }
}
```

当 `id` 属性是一个数组时，表示一个类对象有多个标识符。例如：

```typescript
import { Component } from '@celljs/core';

@Component({ id: ['HelloWorld', 'Hello'] })
export class HelloWorld {
    greet() {
        return 'Hello, World!';
    }
}
```

当不设置 `id` 属性时，则默认使用类作为标识符。例如：

```typescript
import { Component } from '@celljs/core';

@Component()
export class HelloWorld {
    greet() {
        return 'Hello, World!';
    }
}
```

无论有没有设置 `id` 属性，装饰器所在的类永远都是一个标识符，都可以通过该类获取到类对象。例如：

```typescript
import { Component } from '@celljs/core';

@Component()
export class HelloWorld {
    greet() {
        return 'Hello, World!';
    }
}

@Component()
export class SampleService {
    @Autowired()
    helloWorld: HelloWorld;

    run() {
        console.log(this.helloWorld.greet());
    }
}
```

## @Autowired 装饰器

`@Autowired` 装饰器用于注入依赖对象。该装饰器有以下属性：

- `id`：类对象的标识符。
- `multi`：是否是多个依赖对象。默认是根据属性类型是否为数组，自动判断，在某些情况下，需要强制指定为 `true`。
- `detached`：是否是非托管类对象。默认是 `false`。

例如：

```typescript
import { Autowired } from '@celljs/core';

@Component()
export class SampleService {
    @Autowired({ id: HelloWorld })
    helloWorld: HelloWorld;

    run() {
        console.log(this.helloWorld.greet());
    }
}
```

当不设置 `id` 属性时，则默认使用属性类型作为标识符。例如：

```typescript
import { Autowired } from '@celljs/core';

@Component()
export class SampleService {
    @Autowired()
    helloWorld: HelloWorld;

    run() {
        console.log(this.helloWorld.greet());
    }
}
```

当一个标识在容器中存在多个对象时，可以把属性类型定义为数组，表示是多个依赖对象。例如：

```typescript
import { Autowired } from '@celljs/core';

@Component()
export class SampleService {
    @Autowired()
    helloWorlds: HelloWorld[];

    run() {
        console.log(this.helloWorlds.map(helloWorld => helloWorld.greet()));
    }
}
```

当一个标识在容器中存在多个对象时，也可以通过 `@AutowiredProvider` 装饰器来注入依赖提供者对象，通过依赖提供者对象，获取一类对象列表，支持排序能力。例如：

```typescript
import { AutowiredProvider } from '@celljs/core';

@Component()
export class SampleService {
    @AutowiredProvider({ id: HelloWorld })
    helloWorldProvider: Provider<HelloWorld>;

    run() {
        const helloWorlds = this.helloWorldProvider.sortSync();
        console.log(helloWorlds.map(helloWorld => helloWorld.greet()));
    }
}
```

在使用 esbuild 编译的项目中，由于编译后的代码中没有类型信息，所以无法自动判断是否是多个依赖对象，需要强制指定为 `true`， 或者使用 `@AutowiredProvider` 装饰器。

## @Value 装饰器

`@Value` 装饰器用于注入配置属性。该装饰器有以下属性：

- `el`：配置属性的 EL 表达式。
- `detached`：是否是非托管类对象。默认是 `false`。

例如：

```typescript
import { Value } from '@celljs/core';

@Component()
export class SampleService {
    @Value('app.name')
    appName: string;

    run() {
        console.log(`App Name: ${this.appName}`);
    }
}
```

## @Constant 装饰器

`@Constant` 装饰器用于注册常量对象到 IoC 容器中。该装饰器有以下属性：

- `id`：常量对象的标识符。
- `constantValue`：常量对象的值。
- `rebind`：是否重新绑定常量对象。默认是 `false`。

例如：

```typescript
import { Constant } from '@celljs/core';

@Constant('app.name', 'MyApp')
@Constant('app.version', '1.0.0')
export  default class {
}

@Component()
export class SampleService {
    @Autowired('app.name')
    name: string;

    @Autowired('app.version')
    version: string;
```

## @PostConstruct 装饰器

`@PostConstruct` 装饰器用于在类对象初始化后执行。例如：

```typescript
import { Component, PostConstruct } from '@celljs/core';

@Component()
export class SampleService {
    @PostConstruct()
    init() {
        console.log('SampleService initialized.');
    }
}
```

## @PreDestroy 装饰器

`@PreDestroy` 装饰器用于在类对象销毁前执行。例如：

```typescript
import { Component, PreDestroy } from '@celljs/core';

@Component()
export class SampleService {
    @PreDestroy()
    destroy() {
        console.log('SampleService destroyed.');
    }
}
```

## @Named 装饰器

`@Named` 装饰器用于指定注入对象的名称。例如：

```typescript
import { Autowired, Named } from '@celljs/core';

@component({ name: 'HelloWorld' })
export class HelloWorld {
    greet() {
        return 'Hello, World!';
    }
}

@Component()
export class SampleService {
    @Autowired()
    @Named('HelloWorld')
    helloWorld: HelloWorld;

    run() {
        console.log(this.helloWorld.greet());
    }
}
```

## @Tagged 装饰器

`@Tagged` 装饰器用于标识注入对象是标记的。例如：

    tag?: { tag: string | number | symbol, value: any };


```typescript
import { Autowired, Tagged } from '@celljs/core';

@Component({ tag: { tag: 'tag1', value: 'HelloWorld' } })
export class HelloWorld {
    greet() {
        return 'Hello, World!';
    }
}

@Component()
export class SampleService {
    @Autowired()
    @Tagged('tag1', 'HelloWorld')
    helloWorld: HelloWorld;

    run() {
        console.log(this.helloWorld.greet());
    }
}
```

## @Optional 装饰器

`@Optional` 装饰器用于标识注入对象是可选的。当类属性添加了一个 `@Autowired` 注解时，如果没有找到对应的类对象，会抛出一个异常。如果添加了一个 `@Optional` 注解，当没有找到对应的类对象时，会设置属性值为 `undefined`。例如：

```typescript
import { Autowired, Optional } from '@celljs/core';

@Component()
export class SampleService {
    @Autowired()
    @Optional()
    helloWorld: HelloWorld;

    run() {
        console.log(this.helloWorld?.greet());
    }
}
```

## @Aspect 装饰器

`@Aspect` 装饰器用于定义切面对象。提供 AOP 编程的能力。继承了 `@Component` 装饰器的所有属性。再此之上，添加了 `pointcut` 属性，用于指定切点。该装饰器有以下属性：

- `id`：类对象的标识符。相较于 `@Component` 装饰器，`id` 属性不是数组，只能是一个标识符。
- `pointcut`：切点。默认是 `COMPONENT_TAG`。表示拦截所以使用 `@Component` 装饰器注册的类对象。也可以自定义切点，例如 `AOP_TAG`。

例如：

```typescript
import { MethodBeforeAdvice, Autowired, Aspect, AfterReturningAdvice, Value, ConfigUtil, Injectable } from '@celljs/core';
import { AccessDecisionManager, MethodSecurityMetadataContext, ResourceNameResolver, SecurityMetadataSource, SECURITY_EXPRESSION_CONTEXT_KEY } from './access-protocol';
import { AOP_POINTCUT } from '@celljs/web';
import { SecurityContext } from '../context';
import { AuthorizeType } from '../../common';
import { Context } from '@celljs/web/lib/node';

const pointcut = ConfigUtil.getRaw().cell.security.aop?.pointcut || AOP_POINTCUT;

@Injectable()
export abstract class AbstractSecurityMethodAdivice {

    @Autowired(AccessDecisionManager)
    protected readonly accessDecisionManager: AccessDecisionManager;

    @Autowired(SecurityMetadataSource)
    protected readonly securityMetadataSource: SecurityMetadataSource;

    @Autowired(ResourceNameResolver)
    protected readonly resourceNameResolver: ResourceNameResolver;

    @Value('cell.security.enabled')
    protected readonly enabled: boolean;

    protected needAccessDecision(method: string | number | symbol) {
        return this.enabled && typeof method === 'string' && SecurityContext.getCurrent();
    }
}

@Aspect({ id: MethodBeforeAdvice, pointcut })
export class SecurityMethodBeforeAdivice extends AbstractSecurityMethodAdivice implements MethodBeforeAdvice {

    async before(method: string | number | symbol, args: any[], target: any): Promise<void> {
        if (this.needAccessDecision(method)) {
            const ctx: MethodSecurityMetadataContext = { method: method as string, args, target, authorizeType: AuthorizeType.Pre, grant: 0 };
            const securityMetadata = await this.securityMetadataSource.load(ctx);
            const resouces = await this.resourceNameResolver.resolve(ctx);
            for (const resource of resouces) {
                securityMetadata.resource = resource;
                await this.accessDecisionManager.decide(securityMetadata);
            }
        }
    }

}

@Aspect({ id: AfterReturningAdvice, pointcut })
export class SecurityAfterReturningAdvice extends AbstractSecurityMethodAdivice implements AfterReturningAdvice {

    async afterReturning(returnValue: any, method: string | number | symbol, args: any[], target: any): Promise<void> {
        if (this.needAccessDecision(method)) {
            const oldCtx = Context.getAttr<MethodSecurityMetadataContext>(SECURITY_EXPRESSION_CONTEXT_KEY);
            const newCtx = { method: method as string, args, target, returnValue, authorizeType: AuthorizeType.Post, grant: oldCtx.grant };
            const securityMetadata = await this.securityMetadataSource.load(newCtx);
            const resouces = await this.resourceNameResolver.resolve(newCtx);
            for (const resource of resouces) {
                securityMetadata.resource = resource;
                await this.accessDecisionManager.decide(securityMetadata);
            }
        }
    }

}
```


## 其他装饰器

其他非常用的装饰器，可以参考 [InversifyJS](https://github.com/inversify/InversifyJS)。


## AOP 面向切面编程

Cell 核心组件提供了 AOP 面向切面编程的能力，支持在类对象的方法执行前、执行后、执行异常时执行一些操作。通过 `@Aspect` 装饰器可以定义切面对象，通过 `MethodBeforeAdvice`、`AfterReturningAdvice`、`AfterThrowsAdvice` 接口可以定义通知对象。

AOP 能力涉及一下接口：

- `MethodBeforeAdvice`：在方法执行前执行。
- `AfterReturningAdvice`：在方法执行后执行。
- `AfterThrowsAdvice`：在方法执行异常时执行。

可以使用 `@Aspect` 装饰器定义切面对象，通过 `pointcut` 属性指定切点。例如：

```typescript
import { MethodBeforeAdvice, Autowired, Aspect, AfterReturningAdvice, Value, ConfigUtil, Injectable } from '@celljs/core';

const pointcut = 'test';

@Component({ id: MethodBeforeAdvice, pointcut })
export class TestMethodBeforeAdvice implements MethodBeforeAdvice {

    async before(method: string | number | symbol, args: any[], target: any): Promise<void> {
        console.log('before');
    }

}

@Component({ id: AfterReturningAdvice, pointcut })
export class TestAfterReturningAdvice implements AfterReturningAdvice {

    async afterReturning(returnValue: any, method: string | number | symbol, args: any[], target: any): Promise<void> {
        console.log('after');
    }

}

@Component({ id: AfterThrowsAdvice, pointcut })
export class TestAfterThrowsAdvice implements AfterThrowsAdvice {
    
    async afterThrows(error: any, method: string | number | symbol, args: any[], target: any): Promise<void> {
        console.log('throws');
    }

}
```

上面的示例表示定义了一个切面对象，通过 `pointcut` 属性指定切点为 `test`。当一个类对象的方法执行前、执行后、执行异常时，会执行相应的操作。其中，切点为 `test`，表示拦截所有使用 `@Component` 装饰器注册的类对象，且 sysTag 为 `test`。


## 搭建应用

Cell 核心组件提供了一个轻量级的应用框架，用于搭建应用程序。通过 `Application` 接口可以定义应用程序，通过 `ApplicationLifecycle` 接口可以定义应用程序的生命周期。通过 `ApplicationLifecycle` 接口可以定义应用程序的生命周期。通过 `ApplicationStateService` 接口可以定义应用程序的状态管理。通过 `ApplicationFactory` 可以创建应用实例。

一般使用 ApplicationFactory 创建应用实例，加载 IoC 容器模块，组装成一个完整的 IoC 容器。例如：

```typescript
import { ApplicationFactory } from '@celljs/core';
import { SampleService } from './sample-service';
import { SampleModule } from './sample-module';

(async () => {
    const appProps = {
        app: { name: 'MyApp' }
    };
    const app = await ApplicationFactory.create(appProps, SampleModule);
    app.start();
})();
```

在应用程序中，可以通过 `ApplicationLifecycle` 接口定义应用程序的生命周期。例如：

```typescript
import { ApplicationLifecycle, Application } from '@celljs/core';

export class SampleLifecycle implements ApplicationLifecycle {
    onStart(app: Application): Promise<void> {
        return Promise.resolve();
    }

    onStop(app: Application): void {
        console.log('Application stopped.');
    }
}
```

另外，在 browser 和 node 目录下，提供了 `Application` 的实现，可以直接使用。

## 目录结构说明

```shell
.
├── browser                        # 浏览器端应用
│   ├── application                # 前端应用程序
│   ├── browser.ts                 # 与浏览器相关的工具方法
│   ├── index.ts                   # 导出模块
│   ├── shell                      # 前端应用程序启动入口
│   └── static-module.ts           # 静态加载类型的 IoC 容器模块
├── common                         # 公共模块
│   ├── annotation                 # 装饰器定义目录
│   ├── aop                        # AOP 相关
│   ├── application                # 后端应用程序
│   ├── config                     # 配置属性
│   ├── constants.ts               # 常量定义
│   ├── container                  # IoC 容器
│   ├── el                         # EL 表达式
│   ├── error                      # 错误处理
│   ├── index.ts                   # 导出模块
│   ├── logger                     # 日志
│   ├── provider                   # 依赖提供者
│   ├── static-module.ts           # 静态加载类型的 IoC 容器模块
│   ├── test                       # 测试
│   └── utils                      # 工具方法
├── node                           # Node.js 端应用
│   ├── application                # 后端应用程序
│   ├── constants.ts               # 常量定义
│   ├── context                    # 上下文
│   ├── index.ts                   # 导出模块
│   ├── static-module.ts           # 静态加载类型的 IoC 容器模块
│   └── utils                      # 工具方法
└── package.spec.ts                # 单元测试
```

## 错误类型

Cell 核心组件提供了一些常用的错误类型，用于处理异常情况。

- `CustomError`：自定义错误类型。
- `IllegalArgumentError`：非法参数错误。
- `IllegalStateError`：非法状态错误。
- `InvalidMimeTypeError`：无效的 MIME 类型错误。

例如：

```typescript
import { IllegalArgumentError } from '@celljs/core';

if (condition) {
    throw new IllegalArgumentError('Invalid argument.');
}
```

由于 JS 的运行时提供的错误类型无法通过 `instanceof` 运算符来判断，所以 Cell 核心组件提供了 `CustomError` 基类，用于自定义错误类型。所以建议自定义错误类型都继承自 `CustomError` 基类。

## 日志

Cell 核心组件提供了日志功能，支持日志级别、日志格式、日志输出等功能。通过 `Logger` 接口可以定义日志对象，通过 `TraceIdProvider` 接口可以定义跟踪 ID 提供者。

日志级别有以下几种：

- `verbose`：详细信息。
- `debug`：调试信息。
- `info`：信息。
- `warn`：警告。
- `error`：错误。

例如：

```typescript
import { Logger } from '@celljs/core';

@Component()
export class SampleService {

    @Autowired(Logger)
    logger: Logger;

    run() {
        this.logger.info('Info message.');
        this.logger.error('Error message.');
    }
}
```

其中，默认提供的日志输出为 `console`，为了支持不同类对象，注入的日志对象都是互相独立的，可以通过 `setContext` 方法设置上下文信息。例如：

```typescript
import { Logger } from '@celljs/core';

@Component()
export class SampleService {

    @Autowired(Logger)
    logger: Logger;

    run() {
        this.logger.setContext('SampleService');
        this.logger.info('Info message.');
        this.logger.error('Error message.');
    }
}
```

开发者也可以根据自己的需求，自定义 `Logger` 接口的实现，替换掉默认的实现。例如：

```typescript
import { Component } from '@celljs/core';

@Component({ id: Logger， rebind: true })
export class MyLogger implements Logger {
    // TODO
}
```


## 上下文能力

Cell 核心组件提供了上下文能力，支持应用程序上下文、请求上下文、会话上下文等。通过 `Context` 类可以设置和获取上下文信息。

上下文信息有以下几种：

- `App`：应用程序上下文。
- `Request`：请求上下文。
- `Session`：会话上下文。


```typescript
import { Context, AttributeScope } from '@celljs/core';

Context.setAttr('key', 'value', AttributeScope.Request);
const value = Context.getAttr('key', AttributeScope.Request);
```


上下文运行可以保证上下文信息在函数执行期间有效。例如：

```typescript
import { Context } from '@celljs/core';

Context.run(async () => {
    Context.setAttr('key', 'value1', AttributeScope.Request);
    const value = Context.getAttr('key', AttributeScope.Request);
    console.log(value); // value1
});

Context.run(() => {
    Context.setAttr('key', 'value2', AttributeScope.Request);
    const value = Context.getAttr('key', AttributeScope.Request);
    console.log(value); // value2
});
```

## 常用工具类和方法

Cell 核心组件提供了一些常用的工具类和方法，用于处理一些常见的问题。

- `AnnotationUtil`：注解工具类。
- `Assert`：断言工具类。
- `Async`：异步工具类。
- `Cancellation`：取消工具类。
- `ClassUtil`：类工具类。
- `Disposable`：可释放工具类。
- `Emitter`：事件工具类。
- `Event`：事件工具类。
- `GlobalUtil`：全局工具类。
- `MetadataUtil`：元数据工具类。
- `Prioritizeable`：优先级工具类。
- `PromiseUtil`：Promise 工具类。
- `ProxyUtil`：代理工具类。
- `Types`：类型工具类。
- `UrlUtil`：URL 工具类。
- `generateUUUID`：生成 UUID。
- `OS`：操作系统工具类。
- `MimeTypeUtil`：MIME 类型工具类。
- `MimeType`：MIME 类型。

例如：

```typescript
import { Assert } from '@celljs/core';

Assert.isTrue(condition, 'Invalid argument.');
```

## EL 表达式

Cell 核心组件支持 EL 表达式，EL 表达式是一种简单、易读的模板语言，可以用于在模板中动态生成内容。通过 `ExpressionCompiler` 接口可以编译 EL 表达式，通过 `ExpressionHandler` 接口可以处理 EL 表达式。

有以下核心接口：

- `ExpressionCompiler`：编译 EL 表达式。
- `ExpressionHandler`：处理 EL 表达式。
- `ExpressionContext`：EL 表达式上下文。
- `ContextInitializer`：上下文初始化器。
- `ExpressionContextProvider`：EL 表达式上下文提供者。
- `JexlEngineProvider`：Jexl 引擎提供者。

例如：

```typescript
import { ExpressionHandler } from '@celljs/core';

@Component()
export class SampleService {

    @Autowired(ExpressionHandler)
    expressionHandler: ExpressionHandler;

    run() {
        const result = this.expressionHandler.handle('Hello, ${name}!', { name: 'World' });
        console.log(result); // Hello, World!
    }
}
```

可以为 EL 表达式添加新的上下文变量、函数、变换器等。例如：

```typescript
import { ContextInitializer } from '@celljs/core';

@Component(ContextInitializer)
export class CoreContextInitializer implements ContextInitializer {

    @Autowired(JexlEngineProvider)
    protected readonly jexlEngineProvider: JexlEngineProvider<any>;

    initialize(ctx: ExpressionContext): void {
        if (typeof process !== 'undefined') {
            ctx.env = { ...process.env, _ignoreEl: true };
        }
        const jexlEngine = this.jexlEngineProvider.provide();
        jexlEngine.addTransform('replace',
                (val: string, searchValue: string | RegExp, replaceValue: string) => val && val.replace(new RegExp(searchValue, 'g'), replaceValue));
        jexlEngine.addTransform('regexp',  (pattern: string, flags?: string) => new RegExp(pattern, flags));
        const expressionHandler = ContainerUtil.get<ExpressionHandler>(ExpressionHandler);
        jexlEngine.addTransform('eval',  (text: string) => expressionHandler.handle(text));
    }

    priority = 500;

}
```

应用的属性配置默认支持 EL 表达式模版字符串，例如：

```typescript
import { ApplicationFactory } from '@celljs/core';

(async () => {
    const appProps = {
        app: { name: 'MyApp' },
        env: '${env}',
        version: '${version}',
        appVersion: '${app.name}-${version}',
        appVersion2: '${app.name}-${version}-${env}',
    };
    const app = await ApplicationFactory.create(appProps, SampleModule);
    app.start();
})();
```

## 许可证

本项目采用 MIT 许可证。