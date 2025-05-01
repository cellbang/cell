/** @type {import('eslint').Linter.Config} */
module.exports = {
    root: true,
    extends: [
        require.resolve('@celljs/style-guide/eslint/base'),
        require.resolve('@celljs/style-guide/eslint/warnings'),
        require.resolve('@celljs/style-guide/eslint/errors'),
        require.resolve('@celljs/style-guide/eslint/xss')
    ],
    ignorePatterns: [
        '**/{node_modules,lib,templates}',
        'examples',
    ],
    parserOptions: {
        tsconfigRootDir: __dirname,
        project: 'tsconfig.json'
    }
};