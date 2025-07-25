import { type Meta } from '@storybook/react-vite';

import { SpotifyProvider } from '@/domains/spotifySource/store';

import NewPlaylistLoadForm from './NewPlaylistLoadForm';

const MetaInfo: Meta<typeof NewPlaylistLoadForm> = {
  title: 'Domains/Sources/Spotify',
  component: NewPlaylistLoadForm,
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
    return <NewPlaylistLoadForm setPlaylist={console.log} />;
  },
};
