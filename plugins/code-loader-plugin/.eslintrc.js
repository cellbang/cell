/** @type {import('eslint').Linter.Config} */
module.exports = {
    extends: [
        require.resolve('@malagu/component/configs/build.eslintrc.json')
    ],
    parserOptions: {
        tsconfigRootDir: __dirname,
        project: 'compile.tsconfig.json'
    }
};