/**
 * This is the base for both our browser and Node ESLint config files.
 */
module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'jsdoc', 'import', 'no-null'],
  env: {
    browser: true,
    mocha: true,
    node: true
  },
  ignorePatterns: ['node_modules', 'lib'],
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 6,
    ecmaFeatures: {
      jsx: true
    }
  }
};
