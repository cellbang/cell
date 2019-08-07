# Shared NPM script for malagu packages.

`malaguext` is a command line tool to run shared npm scripts in malagu packages. 

For instance, if you want add a new `hello` script that prints `Hello World`:

- add a new script to [package.json](./package.json) with the `ext:` prefix.

```json
{
    "name": "@malagu/ext-scripts",
    "scripts": {
        "ext:hello": "echo 'Hello World'"
    }
}
```

- install `malaguext` in your package (the actual version can be different)

```json
{
    "name": "@malagu/myextension",
    "devDependencies": {
        "@malagu/ext-scripts": "^0.1.1"
    }
}
```

- you should be able to call `hello` script in the context of your package:

```shell
    npx malaguext hello
````

- and from npm scripts of your package:

```json
{
    "name": "@malagu/myextension",
    "scripts": {
        "hello": "malaguext hello"
    }
}
```
