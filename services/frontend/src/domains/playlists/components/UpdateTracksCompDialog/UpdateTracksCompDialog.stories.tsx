import { type Meta } from '@storybook/react-vite';
import { Button } from '@/shared/components/ui/Button';

import UpdateTracksCompDialog from './UpdateTracksCompDialog';

import { SpotifyProvider } from '@/domains/spotifySource/store';

const MetaInfo: Meta<typeof UpdateTracksCompDialog> = {
  title: 'Domains/Playlists/UpdateTracksCompDialog',
  component: UpdateTracksCompDialog,
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
      <UpdateTracksCompDialog tracks={[]} onTracksCompUpdate={(...args) => new Promise((resolve) => { console.log(...args); resolve(); })}>
        <Button className='w-full'>
          Обновить состав треков
        </Button>
      </UpdateTracksCompDialog>
    );
  },
};
