import type { Meta } from '@storybook/react-vite';

import { SpotifyProvider } from '@/domains/spotifySource/store';

import ExportPlaylistForm from './ExportPlaylistForm';

const MetaInfo: Meta<typeof ExportPlaylistForm> = {
  title: 'Domains/Sources/Spotify/ExportPlaylistForm',
  component: ExportPlaylistForm,
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
    <ExportPlaylistForm
      playlist={{
        name: '',
        order: 0,
        tracks: [],
      }}
      onSuccessExport={console.log}
    />
  ),
};
