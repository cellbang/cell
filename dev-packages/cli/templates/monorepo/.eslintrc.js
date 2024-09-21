/** @type {import('eslint').Linter.Config} */
module.exports = {
    root: true,
    extends: [
        require.resolve('@celljs/component/configs/base.eslintrc.json'),
        require.resolve('@celljs/component/configs/warnings.eslintrc.json'),
        require.resolve('@celljs/component/configs/errors.eslintrc.json'),
        require.resolve('@celljs/component/configs/xss.eslintrc.json')
    ],
    ignorePatterns: [
        '**/{node_modules,lib}',
        'plugins'
    ],
    parserOptions: {
        tsconfigRootDir: __dirname,
        project: 'tsconfig.json'
    }
};