'use client';

import { useState } from 'react';
import {
  Music, Loader2, X, CheckCircle, AlertCircle,
} from 'lucide-react';

import type { Track } from '@/shared/types';
import { spotifyApi } from '@/infrastructure/api/spotify';
import { useSpotifyStore } from '@/domains/spotifySource/store';
import { updateTrackWithSpotify, isExactMatch } from '@/shared/utils/playlist';
import { Button } from '@/shared/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/Dialog';
import { ScrollArea } from '@/shared/components/ui/ScrollArea';

import { usePlaylistStore } from '../../store/playlist-store';

interface BatchSpotifyRecognitionProps {
  tracks: Track[];
}

interface RecognitionResult {
  recognized: Track[];
  unrecognized: Track[];
  total: number;
}

function BatchSpotifyRecognition({ tracks }: BatchSpotifyRecognitionProps) {
  const { currentPlaylist, updateCurrentPlaylistTracks, updatePlaylist } = usePlaylistStore();
  const { authStatus } = useSpotifyStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [result, setResult] = useState<RecognitionResult | null>(null);

  // Функция для очистки состояния диалога
  const resetDialogState = () => {
    setIsRecognizing(false);
    setProgress({ current: 0, total: 0 });
    setResult(null);
  };

  // Функция пакетного распознавания треков
  const handleBatchRecognition = async () => {
    if (!authStatus.isAuthenticated) {
      // eslint-disable-next-line no-alert
      alert('Для распознавания треков необходимо авторизоваться в Spotify');
      return;
    }

    if (!currentPlaylist) return;

    // Получаем список нераспознанных треков на момент начала распознавания
    const tracksToRecognize = tracks.filter((track) => !track.spotifyData);

    setIsRecognizing(true);
    setProgress({ current: 0, total: tracksToRecognize.length });
    setResult(null);

    const updatedTracks = [...tracks];
    const recognized: Track[] = [];
    const unrecognized: Track[] = [];
    let processedCount = 0;

    try {
      for (const [i, track] of tracks.entries()) {
        // Пропускаем треки, которые уже связаны со Spotify
        if (track.spotifyData) {
          continue;
        }

        // Добавляем задержку между запросами, чтобы не забомбить API
        if (processedCount > 0) {
          await new Promise((resolve) => setTimeout(resolve, 200));
        }

        try {
          const query = `${track.artist} ${track.title}`.trim();
          const response = await spotifyApi.searchTracks(query, 5); // Ищем только 5 результатов для точности

          // Ищем точное совпадение
          const exactMatch = response.tracks.items.find((spotifyTrack) => isExactMatch(track, spotifyTrack));

          if (exactMatch) {
            // Обновляем трек с данными из Spotify
            const updatedTrack = await updateTrackWithSpotify(track, exactMatch);
            updatedTracks[i] = updatedTrack;
            recognized.push(updatedTrack);
          } else {
            unrecognized.push(track);
          }
        } catch (error) {
          console.error(`Error recognizing track "${track.title}":`, error);
          unrecognized.push(track);
        }

        processedCount++;
        setProgress({ current: processedCount, total: tracksToRecognize.length });
      }

      // Обновляем плейлист с распознанными треками
      if (recognized.length > 0) {
        updateCurrentPlaylistTracks(updatedTracks);
        await updatePlaylist({
          ...currentPlaylist,
          tracks: updatedTracks,
        });
      }

      setResult({
        recognized,
        unrecognized,
        total: tracksToRecognize.length,
      });
    } catch (error) {
      console.error('Batch recognition error:', error);
      // eslint-disable-next-line no-alert
      alert('Произошла ошибка при распознавании треков');
    } finally {
      setIsRecognizing(false);
    }
  };

  // Фильтруем треки, которые можно распознать (без связи со Spotify)
  const unrecognizedTracks = tracks.filter((track) => !track.spotifyData);

  const handleDialogOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      // Очищаем состояние при открытии диалога
      resetDialogState();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
      <DialogTrigger asChild>
        <Button
          onClick={() => setIsOpen(true)}
          disabled={!authStatus.isAuthenticated || unrecognizedTracks.length === 0}
          variant='outline'
          className='flex items-center gap-2'
          title={
            authStatus.isAuthenticated
              ? unrecognizedTracks.length === 0
                ? 'Все треки уже связаны со Spotify'
                : 'Найти точные совпадения треков в Spotify'
              : 'Необходима авторизация в Spotify'
          }
        >
          <Music className='h-4 w-4' />
          Распознать в Spotify
          {unrecognizedTracks.length > 0 && (
            <span className='text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full'>
              {unrecognizedTracks.length}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className='max-w-2xl max-h-[80vh] overflow-hidden'>
        <DialogHeader>
          <DialogTitle>Распознавание треков в Spotify</DialogTitle>
          <DialogDescription>
            Поиск точных совпадений треков в Spotify API
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          {authStatus.isAuthenticated
            ? unrecognizedTracks.length === 0
              ? (
                  <div className='text-center py-8'>
                    <CheckCircle className='h-12 w-12 text-green-500 mx-auto mb-4' />
                    <h3 className='text-lg font-semibold mb-2'>Все треки связаны</h3>
                    <p className='text-muted-foreground'>
                      Все треки в плейлисте уже связаны со Spotify
                    </p>
                  </div>
                )
              : isRecognizing
                ? (
                    <div className='text-center py-8'>
                      <Loader2 className='h-12 w-12 animate-spin text-blue-500 mx-auto mb-4' />
                      <h3 className='text-lg font-semibold mb-2'>Распознаем треки...</h3>
                      <p className='text-muted-foreground'>
                        Прогресс: {progress.current} из {progress.total}
                      </p>
                      <div className='w-full bg-gray-200 rounded-full h-2 mt-4'>
                        <div
                          className='bg-blue-500 h-2 rounded-full transition-all duration-300'
                          style={{ width: `${(progress.current / progress.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  )
                : result
                  ? (
                      <div className='space-y-4'>
                        <div className='text-center'>
                          <CheckCircle className='h-12 w-12 text-green-500 mx-auto mb-4' />
                          <h3 className='text-lg font-semibold mb-2'>Распознавание завершено</h3>
                          <p className='text-muted-foreground'>
                            Распознано {result.recognized.length} из {result.total} треков
                          </p>
                        </div>

                        {result.recognized.length > 0 && (
                          <div className='space-y-2'>
                            <h4 className='font-medium text-green-700 flex items-center gap-2'>
                              <CheckCircle className='h-4 w-4' />
                              Распознанные треки ({result.recognized.length})
                            </h4>
                            <ScrollArea className='h-32'>
                              <div className='space-y-1'>
                                {result.recognized.map((track, index) => (
                                  <div key={`recognized-${track.title}-${track.artist}-${index}`} className='flex items-center gap-2 p-2 bg-green-50 rounded'> {/* eslint-disable-line react/no-array-index-key */}
                                    <CheckCircle className='h-4 w-4 text-green-600' />
                                    <span className='text-sm'>{track.artist} - {track.title}</span>
                                  </div>
                                ))}
                              </div>
                            </ScrollArea>
                          </div>
                        )}

                        {result.unrecognized.length > 0 && (
                          <div className='space-y-2'>
                            <h4 className='font-medium text-orange-700 flex items-center gap-2'>
                              <AlertCircle className='h-4 w-4' />
                              Не распознанные треки ({result.unrecognized.length})
                            </h4>
                            <ScrollArea className='h-32'>
                              <div className='space-y-1'>
                                {result.unrecognized.map((track, index) => (
                                  <div key={`unrecognized-${track.title}-${track.artist}-${index}`} className='flex items-center gap-2 p-2 bg-orange-50 rounded'> {/* eslint-disable-line react/no-array-index-key */}
                                    <X className='h-4 w-4 text-orange-600' />
                                    <span className='text-sm'>{track.artist} - {track.title}</span>
                                  </div>
                                ))}
                              </div>
                            </ScrollArea>
                          </div>
                        )}
                      </div>
                    )
                  : (
                      <div className='space-y-4'>
                        <div className='text-center'>
                          <Music className='h-12 w-12 text-blue-500 mx-auto mb-4' />
                          <h3 className='text-lg font-semibold mb-2'>Готов к распознаванию</h3>
                          <p className='text-muted-foreground'>
                            Найдено {unrecognizedTracks.length} треков для распознавания
                          </p>
                        </div>

                        <div className='space-y-2'>
                          <h4 className='font-medium'>Треки для распознавания:</h4>
                          <ScrollArea className='h-32'>
                            <div className='space-y-1'>
                              {unrecognizedTracks.map((track, index) => (
                                <div key={`unrecognized-${track.title}-${track.artist}-${index}`} className='flex items-center gap-2 p-2 bg-gray-50 rounded'> {/* eslint-disable-line react/no-array-index-key */}
                                  <span className='text-sm'>{track.artist} - {track.title}</span>
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        </div>

                        <Button
                          onClick={handleBatchRecognition}
                          className='w-full'
                          size='lg'
                        >
                          <Music className='mr-2 h-4 w-4' />
                          Начать распознавание
                        </Button>
                      </div>
                    )
            : (
                <div className='text-center py-8'>
                  <AlertCircle className='h-12 w-12 text-orange-500 mx-auto mb-4' />
                  <h3 className='text-lg font-semibold mb-2'>Требуется авторизация</h3>
                  <p className='text-muted-foreground'>
                    Для распознавания треков необходимо авторизоваться в Spotify
                  </p>
                </div>
              )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default BatchSpotifyRecognition;
