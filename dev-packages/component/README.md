# CLI for cell packages.

`cell-component` is a command line tool to run shared npm scripts in cell packages. 

For instance, if you want add a new `hello` script that prints `Hello World`:

- add a new script to [package.json](./package.json) with the `ext:` prefix.

```json
{
    "name": "@celljs/component",
    "scripts": {
        "ext:hello": "echo 'Hello World'"
    }
}
```

- install `cell-component` in your package (the actual version can be different)

```json
{
    "name": "@celljs/mycomponent",
    "devDependencies": {
        "@celljs/component": "^0.1.1"
    }
}
```

- you should be able to call `hello` script in the context of your package:

```shell
    npx cell-component hello
````

- and from npm scripts of your package:

```json
{
    "name": "@celljs/mycomponent",
    "scripts": {
        "hello": "cell-component hello"
    }
}
```
