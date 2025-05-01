/**
 * This is all ESLint config files.
 */
module.exports = {
  extends: [
    require.resolve('./base'),
    require.resolve('./errors'),
    require.resolve('./warnings'),
    require.resolve('./xss')
  ]
};
