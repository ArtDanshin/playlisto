import playlistoReactConfig from 'eslint-config-playlisto/index.js'
import tseslint from 'typescript-eslint'

export default tseslint.config({
  extends: [playlistoReactConfig],
  ignores: ['dist/**', 'node_modules/**', '*.config.js'],
  files: ['**/*.{js,ts,tsx}'],
})
