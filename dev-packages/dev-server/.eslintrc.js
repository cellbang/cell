/** @type {import('eslint').Linter.Config} */
module.exports = {
    extends: [
        require.resolve('@celljs/style-guide/eslint/build')
    ],
    parserOptions: {
        tsconfigRootDir: __dirname,
        project: 'tsconfig.json'
    }
};