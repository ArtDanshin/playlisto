import { type Meta } from '@storybook/react-vite';
import { Button } from '@/shared/components/ui/Button';

import UpdateTracksDataDialog from './UpdateTracksDataDialog';

import { SpotifyProvider } from '@/domains/spotifySource/store';

const MetaInfo: Meta<typeof UpdateTracksDataDialog> = {
  title: 'Domains/Playlists/UpdateTracksDataDialog',
  component: UpdateTracksDataDialog,
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
      <UpdateTracksDataDialog tracks={[]} onTracksUpdate={console.log}>
        <Button className='w-full'>
          Добавить данные файлов
        </Button>
      </UpdateTracksDataDialog>
    );
  },
};
