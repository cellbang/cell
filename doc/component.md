# Malagu 组件

## 特性
1. 一个 Malagu 组件对应着一个 npm 项目
2. Malagu 组件的 package.json 中需要包含 `malaguComponent` 属性（根组件可以省略）

## malaguComponent
package.son
```json
{
    "malaguComponet": {
        "config": {
            "auto": false, 
            "foo": "bar",
            "frontend": {
                "entry": "lib/browser/application-entry"
            },
            "backend": {
                "entry": "lib/node/dev-application-entry"
            }
        },
        "frontends": [],
        "backends": []
    }
}

```

说明：

1. `config` 是组件的配置对象，frontend 是前端的独有配置属性，backend 是后端独有的配置属性，其他的是前后端共有的配置属性
2. `frontends` 是前端需要加载的 module 列表，默认会尝试加载 组件下的 `lib/browser/frontend-module`，可以通过组件配置属性 `auto` 设置为 false 禁用改默认行为
3. `backends` 是前端需要加载的 module 列表，默认会尝试加载 组件下的 `lib/node/backend-module`，可以通过组件配置属性 `auto` 设置为 false 禁用改默认行为

## 组件之间依赖关系

组件是按照拓扑排序的方式进行加载，采用深度优先算法实现

## 组件配置合并规则

安装拓扑排序后进行配置属性合并，例如：B 依赖 A，那么 B 的配置属性会覆盖 A 的同名配置属性

## 组件配置

所有的组件配置最终会与应用配置合并，形成最终的应用配置