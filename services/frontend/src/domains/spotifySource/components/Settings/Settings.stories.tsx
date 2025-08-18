import type { Meta } from '@storybook/react-vite';

import { SpotifyProvider } from '@/domains/spotifySource/store';

import Settings from './Settings';

const MetaInfo: Meta<typeof Settings> = {
  title: 'Domains/Sources/Spotify/Settings',
  component: Settings,
  decorators: [
    (Story) => (
      <SpotifyProvider>
        <Story />
      </SpotifyProvider>
    ),
  ],
};

export default MetaInfo;

// Компонент настроек Spotify
export const Default = {
  render: () => <Settings />,
};
