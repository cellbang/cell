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
            "vscode-languageserver-protocol",
            "vscode-languageserver-types",
            "webpack-dev-middleware",
            "internal-ip",
            "@malagu/core"
        ],
    }
}
