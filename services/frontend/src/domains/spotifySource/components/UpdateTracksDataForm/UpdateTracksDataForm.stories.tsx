import type { Meta } from '@storybook/react-vite';

import { SpotifyProvider } from '@/domains/spotifySource/store';

import UpdateTracksDataForm from './UpdateTracksDataForm';

const MetaInfo: Meta<typeof UpdateTracksDataForm> = {
  title: 'Domains/Sources/Spotify/UpdateTracksDataForm',
  component: UpdateTracksDataForm,
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
  render: () => <UpdateTracksDataForm tracks={[]} updateTracks={console.log} />,
};
