module.exports = {
    "rules": {
        "@typescript-eslint/await-thenable": "warn",
        "import/no-extraneous-dependencies": "warn",
        "no-return-await": "warn",
        "no-void": "warn",
    },
    "settings": {
        "import/core-modules": [
            "vscode-jsonrpc",
            "vscode-jsonrpc/lib/events",
            "vscode-jsonrpc/lib/messageReader",
            "vscode-jsonrpc/lib/messages",
            "vscode-jsonrpc/lib/messageWriter",
            "vscode-languageserver-protocol",
            "vscode-languageserver-types",
            "webpack-dev-middleware",
            "internal-ip",
            "@malagu/core",
            "@malagu/core/lib/common/container/dynamic-container",
            "@malagu/core/lib/common/annotation/detached",
            "@malagu/core/lib/common/utils/proxy-util",
            "inversify",
            "ora",
            "chalk",
            "js-yaml",
            "jexl",
            "@malagu/react/lib/browser",
            "reflect-metadata",
            "inversify-binding-decorators",
            "url-join",
            "express",
            "@phosphor/messaging",
            "@malagu/cli",
            "fs-extra"
        ],
    }
}
