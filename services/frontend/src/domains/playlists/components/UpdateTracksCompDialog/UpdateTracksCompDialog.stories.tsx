import type { Meta } from '@storybook/react-vite';

import { Button } from '@/shared/components/ui/Button';
import { SpotifyProvider } from '@/domains/spotifySource/store';

import UpdateTracksCompDialog from './UpdateTracksCompDialog';

const MetaInfo: Meta<typeof UpdateTracksCompDialog> = {
  title: 'Domains/Playlists/UpdateTracksCompDialog',
  component: UpdateTracksCompDialog,
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
    <UpdateTracksCompDialog
      tracks={[]}
      onTracksCompUpdate={(...args) => new Promise((resolve) => {
        console.log(...args);
        resolve();
      })}
    >
      <Button className='w-full'>
        Обновить состав треков
      </Button>
    </UpdateTracksCompDialog>
  ),
};
