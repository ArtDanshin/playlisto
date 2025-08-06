import type { Meta } from '@storybook/react-vite';

import { SpotifyProvider } from '@/domains/spotifySource/store';

import AuthStatus from './AuthStatus';

const MetaInfo: Meta<typeof AuthStatus> = {
  title: 'Domains/Sources/Spotify/AuthStatus',
  component: AuthStatus,
  decorators: [
    (Story) => (
      <SpotifyProvider>
        <Story />
      </SpotifyProvider>
    ),
  ],
};

export default MetaInfo;

// Форма загрузки плелиста из Spotify
export const Default = {
  render: () => (
    <AuthStatus />
  ),
};
