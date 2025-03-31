/** @type {import('eslint').Linter.Config} */
module.exports = {
    extends: [
        require.resolve('@celljs/component/configs/build.eslintrc.json')
    ],
    parserOptions: {
        tsconfigRootDir: __dirname,
        project: 'tsconfig.json'
    }
};