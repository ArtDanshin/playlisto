import tseslint from 'typescript-eslint';
import stylistic from '@stylistic/eslint-plugin';

export default tseslint.config(
  {
    files: ['**/*.{js,ts,tsx}'],
    plugins: {
      '@stylistic': stylistic,
    },
    rules: {
      ...stylistic.configs.recommended.rules,
      '@stylistic/arrow-parens': ['error', 'always'],
      '@stylistic/arrow-spacing': ['error', { before: true, after: true }],
      '@stylistic/brace-style': ['error', '1tbs'],
      '@stylistic/dot-location': ['error', 'property'],
      '@stylistic/function-paren-newline': ['error', 'multiline-arguments'],
      '@stylistic/generator-star-spacing': ['error', { before: false, after: true }],
      '@stylistic/object-curly-newline': ['error', {
        multiline: true,
        minProperties: 5,
        consistent: true,
      }],
      '@stylistic/implicit-arrow-linebreak': ['error', 'beside'],
      '@stylistic/jsx-one-expression-per-line': ['off'], // Плохо дружит с текстовым контектом с переменными внутри
      '@stylistic/jsx-max-props-per-line': ['error', { maximum: 3 }],
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
      '@stylistic/lines-between-class-members': ['error', 'always', { exceptAfterSingleLine: false }],
      '@stylistic/no-floating-decimal': 'error',
      '@stylistic/no-multi-spaces': ['error', { ignoreEOLComments: false }],
      '@stylistic/quote-props': ['error', 'as-needed', { keywords: false, unnecessary: true, numbers: false }],
      '@stylistic/rest-spread-spacing': ['error', 'never'],
      '@stylistic/semi': ['error', 'always'],
      '@stylistic/template-curly-spacing': 'error',
      '@stylistic/wrap-iife': ['error', 'outside', { functionPrototypeMethods: false }],
      '@stylistic/yield-star-spacing': ['error', 'after'],
    },
  },
);
