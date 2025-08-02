'use client';

import { useState, type ReactNode } from 'react';
import { Download } from 'lucide-react';

import { StepsDialog, type Step } from '@/shared/components/StepsDialog';
import { CardHorizontal } from '@/shared/components/CardHorizontal';
import { common as fileCommon, exportPlaylist as fileExportPlaylist } from '@/domains/fileSource';
import { common as spotifyCommon, exportPlaylist as spotifyExportPlaylist } from '@/domains/spotifySource';
import type { SourceCommon, SourceExportPlaylist } from '@/shared/types/source';
import type { Playlist } from '@/shared/types/playlist';

const SOURCES: string[] = ['spotify', 'file'];
const SOURCES_DATA: Record<string, SourceCommon & SourceExportPlaylist> = {
  file: { ...fileCommon, ...fileExportPlaylist },
  spotify: { ...spotifyCommon, ...spotifyExportPlaylist },
}

interface UpdateTracksDataDialogProps {
  playlist: Playlist;
  children: ReactNode;
}

function NewPlaylistDialog({ playlist, children }: UpdateTracksDataDialogProps) {
  const [currentSource, setCurrentSource] = useState<string | undefined>();
  const [successMessages, setSuccessMessages] = useState<{ mainMessage: string, secondMessage?: ReactNode } | null>(null);

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
    component: (next, prev) => {
      if (currentSource) {
        const ExportForm = SOURCES_DATA[currentSource].ExportForm;

        const handleSetPlaylist = (mainMessage: string, secondMessage: ReactNode) => {
          setSuccessMessages({ mainMessage, secondMessage });
          next();
        }

        return <ExportForm playlist={playlist} onSuccessExport={handleSetPlaylist} onCancel={prev}/>;
      }
      
      return null;
    },
  }

  const stepResult: Step = {
    component: () => {
      return (
        <div className='text-center space-y-4'>
          <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto'>
            <Download className='h-8 w-8 text-green-600' />
          </div>
          <h3 className='text-lg font-semibold text-green-600'>Экспорт завершен!</h3>
          <p className='text-muted-foreground'>
            {successMessages?.mainMessage}
          </p>
          {successMessages?.secondMessage && (
            <div className='pt-2'>
              {successMessages.secondMessage}
            </div>
          )}
        </div>
      );
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
