import globals from 'globals';
import tseslint from 'typescript-eslint';

import importConfig from './import.js';
import react from './react.js';
import javascript from './javascript.js';
import typescript from './typescript.js';
import stylistic from './stylistic.js';
import unicorn from './unicorn.js';

export default tseslint.config(
  {
    extends: [importConfig, javascript, react, stylistic, typescript, unicorn],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
);
