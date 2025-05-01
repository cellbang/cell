/**
 * This is the warnings only for typescript ESLint config files.
 */
module.exports = {
  plugins: ['deprecation'],
  rules: {
    '@typescript-eslint/await-thenable': 'warn',
    'deprecation/deprecation': 'warn'
  }
};
