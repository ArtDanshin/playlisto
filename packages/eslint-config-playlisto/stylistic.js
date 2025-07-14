import tseslint from 'typescript-eslint'
import stylistic from '@stylistic/eslint-plugin'

export default tseslint.config(
  {
    files: ['**/*.{js,ts,tsx}'],
    plugins: {
        '@stylistic': stylistic
    },
    rules: {
      ...stylistic.configs.recommended.rules,
      '@stylistic/arrow-parens': ['error', 'always'],
      '@stylistic/brace-style': ['error', '1tbs'],
      'object-curly-newline': ['error', {
        multiline: true,
        minProperties: 5,
        consistent: true
      }],
      '@stylistic/jsx-quotes': ['error', 'prefer-single'],
      '@stylistic/member-delimiter-style': ['error', {
        multiline: {
          delimiter: 'semi',
          requireLast: true,
        },
        singleline: {
          delimiter: 'semi',
          requireLast: true,
        },
      }],
      '@stylistic/semi': ['error', 'always'],
    },
  },
) 