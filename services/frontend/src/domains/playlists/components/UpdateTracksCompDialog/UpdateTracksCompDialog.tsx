'use client';

import { useState, useMemo, type ReactNode } from 'react';
import { CheckCircle, RefreshCw } from 'lucide-react';

import { Button } from '@/shared/components/ui/Button';
import { Checkbox } from '@/shared/components/ui/Checkbox';
import { Label } from '@/shared/components/ui/Label';
import { Separator } from '@/shared/components/ui/Separator';
import { StepsDialog, type Step } from '@/shared/components/StepsDialog';
import { common as fileCommon, updateTracksComp as fileUpdateTracksComp } from '@/domains/fileSource';
import { common as spotifyCommon, updateTracksComp as spotifyUpdateTracksComp } from '@/domains/spotifySource';
import type { SourceCommon, SourceUpdateTracksComp } from '@/shared/types/source';
import type { Track, Playlist } from '@/shared/types/playlist';
import { getTracksComparison } from '@/shared/utils/playlist';

const SOURCES: string[] = ['spotify', 'file'];
const SOURCES_DATA: Record<string, SourceCommon & SourceUpdateTracksComp> = {
  file: { ...fileCommon, ...fileUpdateTracksComp },
  spotify: { ...spotifyCommon, ...spotifyUpdateTracksComp },
}

interface UpdateTracksCompDialogProps {
  tracks: Track[];
  onTracksCompUpdate: (tracks: Track[], newTracks: Track[]) => Promise<void>;
  children: ReactNode;
}

interface SyncOptions {
  addNewTracks: boolean;
  removeMissingTracks: boolean;
  syncOrder: boolean;
}

function UpdateTracksCompDialog({ tracks, onTracksCompUpdate, children }: UpdateTracksCompDialogProps) {
  const [currentSource, setCurrentSource] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [uploadedPlaylist, setUploadedPlaylist] = useState<Playlist>();
  const [syncOptions, setSyncOptions] = useState<SyncOptions>({
    addNewTracks: true,
    removeMissingTracks: true,
    syncOrder: true,
  });
  
  const handleSyncOptionsChange = (option: keyof SyncOptions, value: boolean) => {
    setSyncOptions((prev) => ({
      ...prev,
      [option]: value,
    }));
  };

  const compTracks: ReturnType<typeof getTracksComparison> = useMemo(() => {
    if (tracks && uploadedPlaylist) {
      return getTracksComparison(tracks, uploadedPlaylist.tracks, currentSource);
    }
    
    return {
      addTracks: [],
      missingTracks: [],
      commonTracks: [],
    }
  }, [tracks, uploadedPlaylist])

  const stepBeggin: Step = {
    component: (next) => {
      const moveNext = (source: string) => {
        setCurrentSource(source);
        next();
      };
      
      return (
        <div className='space-y-4'>
          <div className='grid grid-cols-2 gap-4'>
            {SOURCES.map((source) => {
              const Icon = SOURCES_DATA[source].Icon
              
              return (
                <Button
                  variant='outline'
                  className='h-24 flex flex-col items-center justify-center gap-2 p-4'
                  onClick={() => moveNext(source)}
                  key={`choice-${source}`}
                >
                  <Icon className='h-8 w-8 text-muted-foreground' />
                  <div className='text-center'>
                    <div className='font-medium'>{SOURCES_DATA[source].title}</div>
                    <div className='text-sm text-muted-foreground leading-relaxed whitespace-normal break-words'>
                      {SOURCES_DATA[source].description}
                    </div>
                  </div>
                </Button>
              )
            })}
          </div>
        </div>
      )
    },
  }
  
  const stepProcess: Step = {
    component: (next) => {
      if (currentSource) {
        const LoadForm = SOURCES_DATA[currentSource].LoadForm;

        const handleSetPlaylist = (playlist: Playlist) => {
          setUploadedPlaylist(playlist);
          next();
        }

        return <LoadForm setPlaylist={handleSetPlaylist} />;
      }
      
      return null;
    },
    viewPrevButton: {
      status: 'active',
      text: 'Назад к выбору источника'
    }
  }

  const stepProcessingInfo: Step = {
    component: (next, prev) => {
      const Icon = SOURCES_DATA[currentSource].Icon

      const handleUpdatePlaylist = async() => {
        if (!uploadedPlaylist) return;

        try {
          await onTracksCompUpdate(tracks, uploadedPlaylist.tracks);
          next();
        } catch (error: any) {
          console.error('Ошибка при обновлении состава треков', error);
          setError(error.message)
        }
      }

      return uploadedPlaylist && (
        <>
          {error && (
            <div className='text-sm text-red-600 bg-red-50 p-3 rounded'>
              {error}
            </div>
          )}

          <Separator />

          <div className='space-y-3'>
            <div className='flex items-center gap-2'>
              <Icon className='h-4 w-4' />
              <span className='font-medium'>Загруженный плейлист: {uploadedPlaylist.name}</span>
            </div>

            <div className='p-3 border rounded-lg'>
              <h4 className='font-medium mb-2'>Сравнение плейлистов</h4>
              <div className='space-y-1 text-sm'>
                <div className='flex justify-between'>
                  <span>Новых треков:</span>
                  <span className='font-medium text-green-600'>{compTracks.addTracks.length}</span>
                </div>
                <div className='flex justify-between'>
                  <span>Удаляемых треков:</span>
                  <span className='font-medium text-red-600'>{compTracks.missingTracks.length}</span>
                </div>
                <div className='flex justify-between'>
                  <span>Общих треков:</span>
                  <span className='font-medium'>{compTracks.commonTracks.length}</span>
                </div>
              </div>
            </div>

            <Separator />

            <div className='space-y-3'>
              <Label>Параметры синхронизации</Label>
              <div className='space-y-2'>
                <label className='flex items-center space-x-2'>
                  <Checkbox
                    checked={syncOptions.addNewTracks}
                    onChange={(e) => handleSyncOptionsChange('addNewTracks', e.target.checked)}
                  />
                  <span className='text-sm'>Добавить новые треки</span>
                </label>
                <label className='flex items-center space-x-2'>
                  <Checkbox
                    checked={syncOptions.removeMissingTracks}
                    onChange={(e) => handleSyncOptionsChange('removeMissingTracks', e.target.checked)}
                  />
                  <span className='text-sm'>Удалить отсутствующие треки</span>
                </label>
                <label className='flex items-center space-x-2'>
                  <Checkbox
                    checked={syncOptions.syncOrder}
                    onChange={(e) => handleSyncOptionsChange('syncOrder', e.target.checked)}
                  />
                  <span className='text-sm'>Синхронизировать порядок треков</span>
                </label>
              </div>
            </div>
          </div>

          <div className='flex justify-end gap-2 pt-4'>
            <Button variant='outline' onClick={() => prev()}>
              Отмена
            </Button>
            <Button
              onClick={handleUpdatePlaylist}
              disabled={!uploadedPlaylist}
            >
              <RefreshCw className='mr-2 h-4 w-4' />
              Обновить плейлист
            </Button>
          </div>
        </>
      )
    },
  }

  const stepResult: Step = {
    component: () => {
      return (
        <div className='space-y-4'>
          <div className='text-center'>
            <CheckCircle className='h-12 w-12 text-green-500 mx-auto mb-4' />
            <h3 className='text-lg font-semibold mb-2'>Список треков успешно обновлен</h3>
          </div>
        </div>
      );
    },
    viewCloseButton: {
      status: 'active',
    }
  }
  
  return (
    <StepsDialog
      title='Обновление данных'
      description='Добавьте информацию к трекам из внешних источников'
      trigger={children}
      steps={[stepBeggin, stepProcess, stepProcessingInfo, stepResult]}
    />
  );
}

export default UpdateTracksCompDialog;
