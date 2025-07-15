import tseslint from 'typescript-eslint';

import playlistoConfig from './index.js';

export default tseslint.config({
  extends: [playlistoConfig],
  ignores: ['node_modules/**'],
  files: ['**/*.js'],
  settings: {
    react: {
      version: '19.1.0',
    },
  },
});
