# 注解

框架底层用的是 inversify 依赖注入框架，框架在之上包了一层注解，但是不会影响 inversify 框架原生注解的使用，比如 injectable 和 inject 等等。

## component 注解

用于类上，将类实例化注入到容器中，其他对象可以从容器中取出来使用，可以通过 @autowired 从容器中取需要的实例。

示例：

```typescript
@component()
export class A {

}

@component()
export class B {
    @autowired
    protected a: A;
}
```
说明：如果不提供 id 的话，默认以类为 id。

#### 参数

component 注解支持两种类型参数：id 或者 option，

1. 只提供 id 方式如下：

```typescript
@component('a')
export class A {

}
```
id 支持 string、class 和 Symbol，推荐用 Symbol。

2. option 方式， option 类型定义如下：

```typescript
export interface ComponentOption {
    id?: interfaces.ServiceIdentifier<any>, // 组件的 ID 标识
    scope?: Scope, // 支持三种类型：Request, Singleton, Transient
    rebind?: boolean, // 如果你想替换掉底层容器里面的一个实例，可以通过 rebind: true 来实现
    rpc?: boolean // 告诉框架改组件可以被远端 rpc 调用，推荐使用简化注解 @rpc
}
```
示例：
```typescript
@component({id: ApplicationShell, rebind: true })
export class A {

}
```

## autowired 注解

如果你想在某个类里面使用容器里面的实例，可以通过 autowired 注解来实现，如下：
```typescript
@component()
export class B {
    @autowired
    protected a: A;
}
```

如果不提供需要注入的组件 id 的话，默认以属性类型作为 id。

#### 参数

component 注解支持两种类型参数：id 或者 option。

1. 只提供 id 方式如下：

```typescript
@component()
export class B {
    @autowired('a')
    protected a: A;
}
```
说明：id 支持 string、class 和 Symbol，推荐用 Symbol.

2. option 方式， option 类型定义如下：

```typescript
export interface AutowiredOption {
    id?: ServiceIdentifierOrFunc,
    rpc?: boolean, // 需要注入远端 rpc 组件
    detached?: boolean // 非托管类注入组件，比如 React 组件是不太适合注入到容器里面管理的，但是在 React 组件里面想使用容器里面的服务组件，就可以通过 detached: true 实现
}
```
示例：
```typescript
// detached 为 true 的时候，不需要加 @component()
export class B {
    @autowired({ rpc: true, detached: true })
    protected a: A;
}
```

## value 注解

给类注入应用配置的属性值。

示例：
```typescript
@component()
export class A {
    @value
    protected foo: string; // 从属性配置对象中取 foo 属性
}
```

如果不提供需要注入的 EL 表达式的话，默认以属性名称作为 EL 表达式。

#### 参数

value 注解支持两种类型参数：el 或者 option。

1. 只提供 el 方式如下：

```typescript
@component()
export class A {
    @value('foo')
    protected foo: string;
}
```

2. option 方式， option 类型定义如下：

```typescript
export interface ValueOption {
    el?: string, // 表达式规则请参考：https://github.com/TomFrost/jexl
    detached?: boolean // 非托管类注入组件，比如 React 组件是不太适合注入到容器里面管理的，但是在 React 组件里面想使用容器里面的配置对象，就可以通过 detached: true 实现
}
```
示例：
```typescript
// detached 为 true 的时候，不需要加 @component()
export class A {
    @value({ el: 'foo', detached: true })
    protected foo: string;
}
```

## rpc 注解

rpc 注解是 @component({ rpc: true }) 的简化方式

## autorpc 注解

autorpc 注解是 @autowired({ rpc: true }) 的简化方式

## detached 简化注解

分别提供了两个用于非托管场景的简化注解 autowired 和 autorpc，名字和前面的一样，但是这两个注解所在的包不一样。如下：

```typescript
import { autorpc, autowired, value } from '@malagu/core/lib/common/annotation/detached';

import { autorpc, autowired, value } from '@malagu/core/lib/common/annotation';
```






