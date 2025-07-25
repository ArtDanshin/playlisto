import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: [
    '../src/domains/**/components/**/*.stories.@(ts|tsx)',
    '../src/shared/components/**/*.stories.@(ts|tsx)',
  ],
  addons: [],
  framework: {
    name: '@storybook/react-vite',
    options: {
      builder: {
        viteConfigPath: 'vite.config.test.ts',
      },
    },
  },
  docs: {},
};
export default config;
