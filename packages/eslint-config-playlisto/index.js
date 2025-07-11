import globals from 'globals'
import tseslint from 'typescript-eslint'

import react from './react.js';
import typescript from './typescript.js';
import stylistic from './stylistic.js';

export default tseslint.config(
  {
    extends: [react, stylistic],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    // rules: {
    //   // TypeScript specific rules
    //   '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    //   '@typescript-eslint/no-explicit-any': 'warn',
      
    //   // General rules
    //   'no-console': 'warn',
    //   'no-debugger': 'error',
    //   'prefer-const': 'error',
    //   'no-var': 'error',
    // },
  },
) 