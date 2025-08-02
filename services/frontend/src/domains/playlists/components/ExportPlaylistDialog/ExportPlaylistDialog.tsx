'use client';

import { useState, type ReactNode } from 'react';

import { StepsDialog, type Step } from '@/shared/components/StepsDialog';
import { CardHorizontal } from '@/shared/components/CardHorizontal';
import { common as fileCommon, exportPlaylist as fileExportPlaylist } from '@/domains/fileSource';
import { common as spotifyCommon, exportPlaylist as spotifyExportPlaylist } from '@/domains/spotifySource';
import type { SourceCommon, SourceExportPlaylist } from '@/shared/types/source';
import type { Track } from '@/shared/types/playlist';

const SOURCES: string[] = ['spotify', 'file'];
const SOURCES_DATA: Record<string, SourceCommon & SourceExportPlaylist> = {
  file: { ...fileCommon, ...fileExportPlaylist },
  spotify: { ...spotifyCommon, ...spotifyExportPlaylist },
}

interface UpdateTracksDataDialogProps {
  tracks: Track[];
  onTracksUpdate: (tracks: Track[]) => void;
  children: ReactNode;
}

function NewPlaylistDialog({ tracks, onTracksUpdate, children }: UpdateTracksDataDialogProps) {
  const [currentSource, setCurrentSource] = useState<string | undefined>();

  const stepBeggin: Step = {
    component: (next) => {
      const moveNext = (source: string) => {
        setCurrentSource(source);
        next();
      };
      
      return (
        <div className='space-y-4'>
          <div className='text-center'>
            <h3 className='text-lg font-semibold mb-2'>Выберите формат экспорта</h3>
            <p className='text-muted-foreground mb-6'>
              Куда хотите экспортировать плейлист?
            </p>
          </div>

          <div className='grid gap-4'>
            {SOURCES.map((source) => (
              <CardHorizontal
                title={SOURCES_DATA[source].title}
                description={SOURCES_DATA[source].description}
                Icon={SOURCES_DATA[source].Icon}
                iconBgColorClass={SOURCES_DATA[source].iconBgColorClass}
                iconTextColorClass={SOURCES_DATA[source].iconBgColorClass}
                onClick={() => moveNext(source)}
              />
            ))}
          </div>
        </div>
      )
    },
  }

  
  const stepProcess: Step = {
    component: (next) => {      
      return null;
    },
    viewPrevButton: {
      status: 'active',
      text: 'Назад к выбору'
    }
  }

  const stepResult: Step = {
    component: () => {
      return null;
    },
    viewCloseButton: {
      status: 'active',
    }
  }
  
  return (
    <StepsDialog
      title='Экспорт плейлиста'
      description='Выберите формат и настройте параметры экспорта'
      trigger={children}
      steps={[stepBeggin, stepProcess, stepResult]}
    />
  );
}

export default NewPlaylistDialog;
