import { type Meta } from '@storybook/react-vite';
import { Button } from '@/shared/components/ui/Button';

import ExportPlaylistDialog from './ExportPlaylistDialog';

import { SpotifyProvider } from '@/domains/spotifySource/store';

const MetaInfo: Meta<typeof ExportPlaylistDialog> = {
  title: 'Domains/Playlists/ExportPlaylistDialog',
  component: ExportPlaylistDialog,
  decorators: [
    (Story) => (
      <SpotifyProvider>
        <Story />
      </SpotifyProvider>
    )
  ],
};

export default MetaInfo;

// Базовый popover
export const Default = {
  render: () => {
    return (
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
    );
  },
};
