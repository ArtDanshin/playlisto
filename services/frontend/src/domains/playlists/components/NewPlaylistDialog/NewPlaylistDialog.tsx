'use client';

import { useState, type ReactNode } from 'react';

import { Button } from '@/shared/components/ui/Button';
import { StepsDialog, type Step } from '@/shared/components/StepsDialog';
import type { SourceCommon, SourceNewPlaylist } from '@/shared/types/source';
import type { Playlist } from '@/shared/types/playlist';
import { common as fileCommon, newPlaylist as fileNewPlaylist } from '@/domains/fileSource';
import { common as spotifyCommon, newPlaylist as spotifyNewPlaylist } from '@/domains/spotifySource';

import { usePlaylistStore } from '../../store';

const SOURCES = ['file', 'spotify'];
const SOURCES_DATA: Record<string, SourceCommon & SourceNewPlaylist> = {
  file: { ...fileCommon, ...fileNewPlaylist },
  spotify: { ...spotifyCommon, ...spotifyNewPlaylist },
};

interface NewPlaylistDialogProps {
  children: ReactNode;
}

function NewPlaylistDialog({ children }: NewPlaylistDialogProps) {
  const { addPlaylist } = usePlaylistStore();
  const [currentSource, setCurrentSource] = useState<string | undefined>();

  const addPlaylistToApp = async (playlist: Playlist) => {
    try {
      await addPlaylist(playlist);
    } catch (error) {
      console.error('Failed to add playlist:', error);
    }
  };

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
              const { Icon } = SOURCES_DATA[source];

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
              );
            })}
          </div>
        </div>
      );
    },
  };

  const stepProcess: Step = {
    component: (_, __, close) => {
      if (currentSource) {
        const { LoadForm } = SOURCES_DATA[currentSource];

        const handleSetPlaylist = (playlist: Playlist) => {
          addPlaylistToApp(playlist);
          close();
        };

        return <LoadForm setPlaylist={handleSetPlaylist} />;
      }

      return null;
    },
    viewPrevButton: {
      status: 'active',
      text: 'Назад к выбору источника',
    },
  };

  return (
    <StepsDialog
      title='Добавить плейлист'
      description='Выберите источник для добавления нового плейлиста'
      trigger={children}
      steps={[stepBeggin, stepProcess]}
    />
  );
}

export default NewPlaylistDialog;
