import pluginReactClassic from 'eslint-plugin-react'
import pluginReactNew from '@eslint-react/eslint-plugin'
import pluginReactHooks from 'eslint-plugin-react-hooks'
import pluginReactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

import renameRules from './utils/renameRules.js'

const pluginReactInstances = pluginReactNew.configs.all.plugins

export default tseslint.config({
  files: ['**/*.tsx'],
  languageOptions: {
    parser: tseslint.parser,
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
    },
  },
  plugins: {
    'react-classic': pluginReactClassic,
    'react': pluginReactInstances['@eslint-react'],
    'react-dom': pluginReactInstances['@eslint-react/dom'],
    'react-hooks-extra': pluginReactInstances['@eslint-react/hooks-extra'],
    'react-web-api': pluginReactInstances['@eslint-react/web-api'],
    'react-naming-convention': pluginReactInstances['@eslint-react/naming-convention'],
    'react-hooks': pluginReactHooks,
    'react-refresh': pluginReactRefresh,
  },
  rules: {
    // Порядок важен, так как в pluginReact.configs.recommended.rules есть правила, которые начинаются с @eslint-react/
    ...renameRules(pluginReactNew.configs.recommended.rules, {
      '@eslint-react/dom': 'react-dom',
      '@eslint-react/hooks-extra': 'react-hooks-extra',
      '@eslint-react/web-api': 'react-web-api',
      '@eslint-react/naming-convention': 'react-naming-convention',
      '@eslint-react': 'react',
    }),

    ...renameRules(pluginReactClassic.configs.flat.recommended.rules, {
      'react': 'react-classic'
    }),
    'react-classic/react-in-jsx-scope': 'off',
    'react-classic/forbid-prop-types': ['error', {
      forbid: ['any', 'array', 'object'],
      checkContextTypes: true,
      checkChildContextTypes: true,
    }],
    'react-classic/jsx-boolean-value': ['error', 'never', { always: [] }],
    'react-classic/jsx-closing-bracket-location': ['error', 'line-aligned'],
    'react-classic/jsx-closing-tag-location': 'error',
    'react-classic/jsx-curly-spacing': ['error', 'never', { allowMultiline: true }],
    'react-classic/jsx-handler-names': ['off', {
      eventHandlerPrefix: 'handle',
      eventHandlerPropPrefix: 'on',
    }],
    'react-classic/jsx-indent-props': ['error', 2],
    'react-classic/jsx-max-props-per-line': ['error', { maximum: 1, when: 'multiline' }],
    'react-classic/jsx-no-duplicate-props': ['error', { ignoreCase: true }],
    'react-classic/jsx-no-literals': ['off', { noStrings: true }],
    'react-classic/jsx-no-undef': 'error',
    'react-classic/jsx-pascal-case': ['error', {
      allowAllCaps: true,
      ignore: [],
    }],
    'react-classic/sort-prop-types': ['off', {
      ignoreCase: true,
      callbacksLast: false,
      requiredFirst: false,
      sortShapeProp: true,
    }],
    'react-classic/jsx-sort-props': ['off', {
      ignoreCase: true,
      callbacksLast: false,
      shorthandFirst: false,
      shorthandLast: false,
      noSortAlphabetically: false,
      reservedFirst: true,
    }],
    'react-classic/jsx-sort-default-props': ['off', {
      ignoreCase: true,
    }],
    'react-classic/jsx-uses-react': ['error'],
    'react-classic/jsx-uses-vars': 'error',
    'react-classic/no-danger': 'warn',
    'react-classic/no-deprecated': ['error'],
    'react-classic/no-multi-comp': 'error',
    'react-classic/no-string-refs': 'error',
    'react-classic/no-unknown-property': 'error',
    'react-classic/prefer-es6-class': ['error', 'always'],
    'react-classic/prefer-stateless-function': ['error', { ignorePureComponents: true }],
    'react-classic/require-render-return': 'error',
    'react-classic/self-closing-comp': 'error',
    'react-classic/jsx-wrap-multilines': ['error', {
      declaration: 'parens-new-line',
      assignment: 'parens-new-line',
      return: 'parens-new-line',
      arrow: 'parens-new-line',
      condition: 'parens-new-line',
      logical: 'parens-new-line',
      prop: 'parens-new-line',
    }],
    'react-classic/jsx-first-prop-new-line': ['error', 'multiline-multiprop'],
    'react-classic/jsx-curly-brace-presence': ['error', { props: 'never', children: 'never' }],
    'react-classic/jsx-curly-newline': ['error', {
      multiline: 'consistent',
      singleline: 'consistent',
    }],
    'react-classic/jsx-fragments': ['error', 'syntax'],
    'react-classic/jsx-equals-spacing': ['error', 'never'],
    'react-classic/jsx-one-expression-per-line': ['error', { allow: 'single-child' }],
    'react-classic/jsx-indent': ['error', 2],
    'react-classic/jsx-no-script-url': ['error', [
      {
        name: 'Link',
        props: ['to'],
      },
    ]],
    'react-classic/jsx-no-target-blank': ['error', { enforceDynamicLinks: 'always' }],
    'react-classic/jsx-filename-extension': ['error', { extensions: ['.tsx', '.jsx'] }],
    'react-classic/jsx-no-comment-textnodes': 'error',
    'react-classic/jsx-no-constructed-context-values': 'error',
    'react-classic/jsx-no-useless-fragment': 'error',
    'react-classic/jsx-props-no-multi-spaces': 'error',
    'react-classic/jsx-tag-spacing': ['error', {
      closingSlash: 'never',
      beforeSelfClosing: 'always',
      afterOpening: 'never',
      beforeClosing: 'never',
    }],
    'react-classic/no-render-return-value': 'error',
    'react-classic/no-danger-with-children': 'error',
    'react-classic/style-prop-object': 'error',
    'react-classic/no-unescaped-entities': 'error',
    'react-classic/no-children-prop': 'error',
    'react-classic/require-default-props': ['error', {
      forbidDefaultForRequired: true,
    }],
    'react-classic/void-dom-elements-no-children': 'error',
    'react-classic/no-unused-state': 'error',
    'react-classic/destructuring-assignment': ['error', 'always'],
    'react-classic/no-this-in-sfc': 'error',
    'react-classic/function-component-definition': ['error', {
      namedComponents: ['function-declaration', 'function-expression'],
      unnamedComponents: 'function-expression',
    }],
    'react-classic/no-unstable-nested-components': 'error',
    'react-classic/no-namespace': 'error',
    'react-classic/no-arrow-function-lifecycle': 'error',
    'react-classic/no-invalid-html-attribute': 'error',

    ...pluginReactHooks.configs.recommended.rules,
    ...pluginReactRefresh.configs.recommended.rules,
  },
})