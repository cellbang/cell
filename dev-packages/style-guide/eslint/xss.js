/**
 * This is the xxs ESLint config files.
 */
module.exports = {
  extends: ['plugin:no-unsanitized/recommended-legacy'],
  plugins: ['no-unsanitized', 'react'],
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    }
  },
  rules: {
    'no-unsanitized/method': [
      'warn',
      {
        escape: {
          methods: ['DOMPurify.sanitize']
        }
      }
    ],
    'no-unsanitized/property': [
      'warn',
      {
        escape: {
          methods: ['DOMPurify.sanitize']
        }
      }
    ],
    'no-eval': 'warn',
    'no-implied-eval': 'warn',
    'react/no-danger-with-children': 'warn',
    'react/no-danger': 'warn'
  }
};
