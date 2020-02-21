module.exports = {
    "rules": {
        "@typescript-eslint/no-explicit-any": "off",
        "camelcase": "off",
        "comma-dangle": "off",
        "id-blacklist": "off",
        "id-match": "off",
        "no-magic-numbers": "off",
        "no-underscore-dangle": "off",
        "no-unused-expressions": "off",
        "@typescript-eslint/class-name-casing": "error",
        "@typescript-eslint/consistent-type-definitions": "error",
        "@typescript-eslint/indent": "error",
        "@typescript-eslint/quotes": [
            "error",
            "single",
            {
                "avoidEscape": true
            }
        ],
        "@typescript-eslint/semi": [
            "error",
            "always"
        ],
        "@typescript-eslint/type-annotation-spacing": "error",
        "arrow-body-style": [
            "error",
            "as-needed"
        ],
        "arrow-parens": [
            "error",
            "as-needed"
        ],
        "curly": "error",
        "eol-last": "error",
        "eqeqeq": [
            "error",
            "smart"
        ],
        "guard-for-in": "error",
        "import/no-deprecated": "error",
        "max-len": [
            "error",
            {
                "code": 180
            }
        ],
        "no-multiple-empty-lines": "error",
        "no-new-wrappers": "error",
        "no-null/no-null": "error",
        "no-shadow": [
            "error",
            {
                "hoist": "all"
            }
        ],
        "no-throw-literal": "error",
        "no-trailing-spaces": "error",
        "no-var": "error",
        "one-var": [
            "error",
            "never"
        ],
        "prefer-const": [
            "error",
            {
                "destructuring": "all"
            }
        ],
        "radix": "off",
        // "space-before-function-paren": [
        //     "error",
        //     {
        //         "anonymous": "always"
        //     }
        // ],
        "spaced-comment": "error",
    }
}
