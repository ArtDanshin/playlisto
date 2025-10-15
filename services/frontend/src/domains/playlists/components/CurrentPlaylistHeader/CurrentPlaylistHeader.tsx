'use client';

import { Music, RefreshCw, Edit } from 'lucide-react';

import { Button } from '@/shared/components/ui/Button';

import { usePlaylistStore } from '../../store';
import { CoverWithLoad } from '../CoverWithLoad';
import { UpdateTracksCompDialog } from '../UpdateTracksCompDialog';
import { UpdateTracksDataDialog } from '../UpdateTracksDataDialog';
import { ExportPlaylistDialog } from '../ExportPlaylistDialog';
import { EditMainInfoDialog } from '../EditMainInfoDialog';

function CurrentPlaylistHeader() {
  const { currentPlaylist, updatePlaylistWithCoverLoad, mergeCurrentPlaylistTracks } = usePlaylistStore();

  if (!currentPlaylist) {
    return (
      <div className='flex items-center justify-between'>
        <h2 className='text-2xl font-bold'>Треки</h2>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      {/* Заголовок плейлиста */}
      <div className='flex items-start gap-4 p-4 bg-gray-50 rounded-lg'>
        {/* Обложка */}
        <CoverWithLoad
          coverKey={currentPlaylist.coverKey}
          size='xl'
        />

        {/* Информация о плейлисте */}
        <div className='flex-1 min-w-0'>
          <div className='flex items-start justify-between gap-4'>
            <div className='flex-1 min-w-0'>
              <h1 className='text-2xl font-bold text-gray-900 mb-2'>
                {currentPlaylist.name}
              </h1>
              {currentPlaylist.description && (
                <p className='text-gray-600 text-sm leading-relaxed'>
                  {currentPlaylist.description}
                </p>
              )}
              <p className='text-gray-500 text-sm mt-2'>
                {currentPlaylist.tracks.length} треков
              </p>
            </div>

            {/* Кнопка редактирования */}
            <EditMainInfoDialog playlist={currentPlaylist}>
              <Button variant='outline' size='sm'>
                <Edit className='mr-2 h-4 w-4' />
                Редактировать
              </Button>
            </EditMainInfoDialog>
          </div>
        </div>
      </div>

      {/* Кнопки управления */}
      <div className='flex items-center justify-between'>
        <h2 className='text-xl font-semibold'>Треки</h2>
        <div className='flex items-center gap-2'>
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
        </div>
      </div>
    </div>
  );
}

export default CurrentPlaylistHeader;
