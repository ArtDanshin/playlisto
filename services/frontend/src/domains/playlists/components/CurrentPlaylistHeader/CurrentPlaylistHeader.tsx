'use client';

import { Music, RefreshCw } from 'lucide-react';

import { Button } from '@/shared/components/ui/Button';

import { usePlaylistStore } from '../../store';
import { UpdateTracksCompDialog } from '../UpdateTracksCompDialog';
import { UpdateTracksDataDialog } from '../UpdateTracksDataDialog';
import { ExportPlaylistDialog } from '../ExportPlaylistDialog';

function CurrentPlaylistHeader() {
  const { currentPlaylist, updatePlaylistWithCoverLoad, mergeCurrentPlaylistTracks } = usePlaylistStore();

  return (
    <div className='flex items-center justify-between'>
      <h2 className='text-2xl font-bold'>Треки</h2>
      <div className='flex items-center gap-2'>
        {currentPlaylist && (
          <>
            <UpdateTracksCompDialog
              tracks={currentPlaylist.tracks}
              onTracksCompUpdate={mergeCurrentPlaylistTracks}
            >
              <Button variant='outline' size='sm'>
                <RefreshCw className='mr-2 h-4 w-4' />
                Обновить состав
              </Button>
            </UpdateTracksCompDialog>
            <UpdateTracksDataDialog
              tracks={currentPlaylist.tracks}
              onTracksUpdate={(tracks) => updatePlaylistWithCoverLoad({ ...currentPlaylist, tracks })}
            >
              <Button variant='outline' size='sm'>
                <Music className='mr-2 h-4 w-4' />
                Обновить данные
              </Button>
            </UpdateTracksDataDialog>
            <ExportPlaylistDialog playlist={currentPlaylist}>
              <Button variant='outline' size='sm'>
                <Music className='mr-2 h-4 w-4' />
                Экспорт
              </Button>
            </ExportPlaylistDialog>
          </>
        )}
      </div>
    </div>
  );
}

export default CurrentPlaylistHeader;
