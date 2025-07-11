import globals from 'globals'
import tseslint from 'typescript-eslint'
import stylistic from '@stylistic/eslint-plugin'

export default tseslint.config(
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
        '@stylistic': stylistic
    },
    rules: {
      ...stylistic.configs.recommended.rules
    },
  },
) 