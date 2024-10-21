import antfu from '@antfu/eslint-config'

export default antfu({
  rules: {
    /// 必须要关闭的规则，否则依赖注入不可用
    'perfectionist/sort-imports': 'off',
    'ts/consistent-type-imports': 'off',
    'ts/no-empty-object-type': 'off',
    'ts/no-redeclare': 'off',

    // 可选的规则
    'antfu/if-newline': 'off',
  },
  ignores: [
    '.cell',
    'lib',
    'node_modules',
    'dist',
  ],
})
