/**
 * This is the build ESLint config files.
 */
module.exports = {
  extends: [require.resolve('./base'), require.resolve('./errors')]
};
