import { Plus } from 'lucide-react';

import { Button } from '@/shared/components/ui/Button';

import NewPlaylistDialog from './NewPlaylistDialog';

export default {
  title: 'Domains/Playlists/NewPlaylistDialog',
  component: NewPlaylistDialog,
};

// Базовый popover
export const Default = {
  render: () => {
    return (
      <NewPlaylistDialog>
        <Button className='w-full'>
          <Plus className='mr-2 h-4 w-4' />
          Добавить плейлист
        </Button>
      </NewPlaylistDialog>
    );
  },
};
