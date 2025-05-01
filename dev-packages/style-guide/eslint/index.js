/**
 * This is all ESLint config files.
 */
module.exports = {
  extends: [
    require.resolve('./base'),
    require.resolve('./errors'),
    require.resolve('./errors-ts'),
    require.resolve('./warnings'),
    require.resolve('./warnings-ts'),
    require.resolve('./xss')
  ]
};
