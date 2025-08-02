import { type Meta } from '@storybook/react-vite';

import { SpotifyProvider } from '@/domains/spotifySource/store';

import SetPlaylistForm from './SetPlaylistForm';

const MetaInfo: Meta<typeof SetPlaylistForm> = {
  title: 'Domains/Sources/Spotify/SetPlaylistForm',
  component: SetPlaylistForm,
  decorators: [
    (Story) => (
      <SpotifyProvider>
        <Story />
      </SpotifyProvider>
    )
  ],
};

export default MetaInfo;

// Форма загрузки плелиста из Spotify
export const Default = {
  render: () => {
    return <SetPlaylistForm setPlaylist={console.log} />;
  },
};
