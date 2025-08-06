import type { Meta } from '@storybook/react-vite';

import { Button } from '@/shared/components/ui/Button';
import { SpotifyProvider } from '@/domains/spotifySource/store';

import ExportPlaylistDialog from './ExportPlaylistDialog';

const MetaInfo: Meta<typeof ExportPlaylistDialog> = {
  title: 'Domains/Playlists/ExportPlaylistDialog',
  component: ExportPlaylistDialog,
  decorators: [
    (Story) => (
      <SpotifyProvider>
        <Story />
      </SpotifyProvider>
    ),
  ],
};

export default MetaInfo;

// Базовый popover
export const Default = {
  render: () => (
    <ExportPlaylistDialog
      playlist={{
        name: '',
        order: 0,
        tracks: [],
      }}
    >
      <Button className='w-full'>
        Экспорт
      </Button>
    </ExportPlaylistDialog>
  ),
};
