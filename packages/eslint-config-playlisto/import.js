import tseslint from 'typescript-eslint'
import importPlugin from 'eslint-plugin-import'

export default tseslint.config(
  {
    extends: [importPlugin.flatConfigs.recommended, importPlugin.flatConfigs.typescript],
    files: ['**/*.{js,ts,tsx}'],
    settings: {
        "import/resolver": {
            typescript: true,
            node: true,
        },
    },
    rules: {
      'import/first': 'error',
      'import/no-absolute-path': 'error',
      'import/no-cycle': ['error', { maxDepth: '∞' }],
      'import/no-dynamic-require': 'error',
      'import/no-import-module-exports': ['error', {
        exceptions: [],
      }],
      'import/no-named-default': 'error',
      'import/no-mutable-exports': 'error',
      'import/no-relative-packages': 'error',
      'import/no-self-import': 'error',
      'import/no-unresolved': ['error', { commonjs: true, caseSensitive: true }],
      'import/newline-after-import': 'error',
      'import/order': [2, {
            groups: [["builtin", "external"], "internal", "parent", "unknown", ["sibling", "index"]],
            "newlines-between": "always",
            warnOnUnassignedImports: true
        }],
    },
  },
) 