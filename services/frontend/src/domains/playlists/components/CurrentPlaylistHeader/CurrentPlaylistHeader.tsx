'use client';

import { Music, RefreshCw } from 'lucide-react';

// import type { Track } from '@/shared/types';
import { Button } from '@/shared/components/ui/Button';

import { usePlaylistStore } from '../../store';
import { UniversalExportDialog } from '../UniversalExportDialog/index.ts';
import { UniversalUpdatePlaylistDialog } from '../UniversalUpdatePlaylistDialog/index.ts';
import { UpdateTracksDataDialog } from '../UpdateTracksDataDialog/index.ts';


function CurrentPlaylistHeader() {
  const { currentPlaylist, updatePlaylist, updateCurrentPlaylistTracks } = usePlaylistStore();
  
  return (
    <div className='flex items-center justify-between'>
      <h2 className='text-2xl font-bold'>Треки</h2>
      <div className='flex items-center gap-2'>
        {currentPlaylist && (
          <>
            <UniversalUpdatePlaylistDialog
              currentPlaylist={currentPlaylist}
              onPlaylistUpdated={updatePlaylist}
            >
              <Button variant='outline' size='sm'>
                <RefreshCw className='mr-2 h-4 w-4' />
                Обновить состав
              </Button>
            </UniversalUpdatePlaylistDialog>
            <UpdateTracksDataDialog tracks={currentPlaylist.tracks} onTracksUpdate={updateCurrentPlaylistTracks}>
              <Button variant='outline' size='sm'>
                <Music className='mr-2 h-4 w-4' />
                Обновить данные
              </Button>
            </UpdateTracksDataDialog>
            <UniversalExportDialog playlist={currentPlaylist}>
              <Button variant='outline' size='sm'>
                <Music className='mr-2 h-4 w-4' />
                Экспорт
              </Button>
            </UniversalExportDialog>
          </>  
        )}
      </div>
    </div>
  );
}

export default CurrentPlaylistHeader;
