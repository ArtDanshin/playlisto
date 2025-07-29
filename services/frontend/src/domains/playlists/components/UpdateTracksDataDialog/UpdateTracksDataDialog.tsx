'use client';

import { useState, type ReactNode } from 'react';
import { AlertCircle, CheckCircle, Music, X } from 'lucide-react';

import { ScrollArea } from '@/shared/components/ui/ScrollArea';
import { StepsDialog, type Step } from '@/shared/components/StepsDialog';
import { common as fileCommon, updateTracksData as fileUpdateTracksData } from '@/domains/fileSource';
import { common as spotifyCommon, updateTracksData as spotifyUpdateTracksData } from '@/domains/spotifySource';
import type { SourceCommon, SourceUpdateTracksData, UpdateTracksAfterMatch } from '@/shared/types/source';
import type { Track } from '@/shared/types/playlist';
import { isExternalServices } from '@/shared/utils/playlist';

const SOURCES: string[] = ['spotify'];
const SOURCES_DATA: Record<string, SourceCommon & SourceUpdateTracksData> = {
  // file: { ...fileCommon, ...fileUpdateTracksData },
  spotify: { ...spotifyCommon, ...spotifyUpdateTracksData },
}

interface UpdateTracksDataDialogProps {
  tracks: Track[];
  onTracksUpdate: (tracks: Track[]) => void;
  children: ReactNode;
}

function NewPlaylistDialog({ tracks, onTracksUpdate, children }: UpdateTracksDataDialogProps) {
  const [currentSource, setCurrentSource] = useState<string | undefined>();
    const [arrayOfProcessedTracks, setArrayOfProcessedTracks] = useState<{onlyUpdatedTracks: Track[], notUpdatedTracks: Track[]}>({
    onlyUpdatedTracks: [],
    notUpdatedTracks: []
  });

  const stepBeggin: Step = {
    component: (next) => {
      const moveNext = (source: string) => {
        setCurrentSource(source);
        next();
      };
      
      return (
        <div className='space-y-6'>
          <div className='text-center'>
            <Music className='h-12 w-12 text-blue-500 mx-auto mb-4' />
            <h3 className='text-lg font-semibold mb-2'>Выберите источник данных</h3>
            <p className='text-muted-foreground'>
              Выберите, какую информацию хотите добавить к трекам плейлиста
            </p>
          </div>

          <div className='grid gap-4'>
            {SOURCES.map((source) => {
              const Icon = SOURCES_DATA[source].Icon
              
              return (
                <div
                  className='cursor-pointer hover:bg-muted/50 transition-colors border rounded-lg p-6'
                  onClick={() => moveNext(source)}
                >
                  <div className='mb-4'>
                    <h3 className='text-lg font-semibold flex items-center gap-2 mb-2'>
                      <Icon className='h-5 w-5' />
                      {SOURCES_DATA[source].title}
                    </h3>
                    <p className='text-sm text-muted-foreground'>
                      {SOURCES_DATA[source].description}
                    </p>
                  </div>
                  <div>
                    <p className='text-sm text-muted-foreground'>
                      {SOURCES_DATA[source].logicDescription}
                    </p>
                  </div>
                </div>
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
        const MatchForm = SOURCES_DATA[currentSource].MatchForm;
        
        const handleUpdateTracks: UpdateTracksAfterMatch = (allTracks, onlyUpdatedTracks, notUpdatedTracks) => {
          onTracksUpdate(allTracks);
          setArrayOfProcessedTracks({ onlyUpdatedTracks, notUpdatedTracks });

          next();
        }
        
        return <MatchForm tracks={tracks} updateTracks={handleUpdateTracks} />;
      }
      
      return null;
    },
    viewPrevButton: {
      status: 'active',
      text: 'Назад к выбору'
    }
  }

  const stepResult: Step = {
    component: () => {
      const title = currentSource && SOURCES_DATA[currentSource].resultTitle;
      const description = currentSource && SOURCES_DATA[currentSource].resultDescription(
        arrayOfProcessedTracks.onlyUpdatedTracks.length,
        arrayOfProcessedTracks.onlyUpdatedTracks.length + arrayOfProcessedTracks.notUpdatedTracks.length
      );

      return (
        <div className='space-y-4'>
          <div className='text-center'>
            <CheckCircle className='h-12 w-12 text-green-500 mx-auto mb-4' />
            <h3 className='text-lg font-semibold mb-2'>{title}</h3>
            <p className='text-muted-foreground'>{description}</p>
          </div>

          {arrayOfProcessedTracks.onlyUpdatedTracks.length > 0 && (
            <div className='space-y-2'>
              <h4 className='font-medium text-green-700 flex items-center gap-2'>
                <CheckCircle className='h-4 w-4' />
                {isExternalServices(currentSource) ? 'Распознанные треки' : 'Треки с данными файлов'} ({result.updated.length})
              </h4>
              <ScrollArea className='h-32'>
                <div className='space-y-1'>
                  {arrayOfProcessedTracks.onlyUpdatedTracks.map((track) => (
                    <div key={`updated-${track.title}-${track.artist}`} className='flex items-center gap-2 p-2 bg-green-50 rounded'>
                      <CheckCircle className='h-4 w-4 text-green-600' />
                      <span className='text-sm'>{track.artist} - {track.title}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {arrayOfProcessedTracks.notUpdatedTracks.length > 0 && (
            <div className='space-y-2'>
              <h4 className='font-medium text-orange-700 flex items-center gap-2'>
                <AlertCircle className='h-4 w-4' />
                {isExternalServices(currentSource) ? 'Не распознанные треки' : 'Треки без данных файлов'} ({result.skipped.length})
              </h4>
              <ScrollArea className='h-32'>
                <div className='space-y-1'>
                  {arrayOfProcessedTracks.notUpdatedTracks.map((track) => (
                    <div key={`skipped-${track.title}-${track.artist}`} className='flex items-center gap-2 p-2 bg-orange-50 rounded'>
                      <X className='h-4 w-4 text-orange-600' />
                      <span className='text-sm'>{track.artist} - {track.title}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
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
      title='Обновление данных'
      description='Добавьте информацию к трекам из внешних источников'
      trigger={children}
      steps={[stepBeggin, stepProcess, stepResult]}
    />
  );
}

export default NewPlaylistDialog;
