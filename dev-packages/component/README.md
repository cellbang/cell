# CLI for malagu packages.

`malagu-component` is a command line tool to run shared npm scripts in malagu packages. 

For instance, if you want add a new `hello` script that prints `Hello World`:

- add a new script to [package.json](./package.json) with the `ext:` prefix.

```json
{
    "name": "@malagu/component",
    "scripts": {
        "ext:hello": "echo 'Hello World'"
    }
}
```

- install `malagu-component` in your package (the actual version can be different)

```json
{
    "name": "@malagu/mycomponent",
    "devDependencies": {
        "@malagu/component": "^0.1.1"
    }
}
```

- you should be able to call `hello` script in the context of your package:

```shell
    npx malagu-component hello
````

- and from npm scripts of your package:

```json
{
    "name": "@malagu/mycomponent",
    "scripts": {
        "hello": "malagu-component hello"
    }
}
```
