'use client';

import { useState } from 'react';
import {
  Music, Loader2, FileText, CheckCircle, AlertCircle, X, Upload,
} from 'lucide-react';

import type { Track } from '@/shared/types';
import { spotifyApi } from '@/infrastructure/api/spotify-api';
import { useSpotifyStore } from '@/domains/spotify/store/spotify-store';
import { updateTrackWithSpotify, isExactMatch } from '@/shared/utils/playlist-utils';
import { parseM3U } from '@/shared/utils/m3u-parser';
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

interface UniversalPlaylistUpdateProps {
  tracks: Track[];
}

interface UpdateResult {
  updated: Track[];
  skipped: Track[];
  total: number;
  source: 'spotify' | 'm3u';
}

type UpdateStep = 'select' | 'spotify' | 'm3u' | 'result';

function UniversalPlaylistUpdate({ tracks }: UniversalPlaylistUpdateProps) {
  const { currentPlaylist, updateCurrentPlaylistTracks, updatePlaylist } = usePlaylistStore();
  const { authStatus } = useSpotifyStore();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<UpdateStep>('select');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [result, setResult] = useState<UpdateResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string>('');

  // Функция для очистки состояния диалога
  const resetDialogState = () => {
    setCurrentStep('select');
    setIsProcessing(false);
    setProgress({ current: 0, total: 0 });
    setResult(null);
    setSelectedFile(null);
    setFileContent('');
  };

  // Обработка выбора файла
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const content = await file.text();
      setFileContent(content);
    }
  };

  // Функция пакетного обновления треков в Spotify
  const handleSpotifyUpdate = async () => {
    if (!authStatus.isAuthenticated || !currentPlaylist) return;

    const tracksToUpdate = tracks.filter((track) => !track.spotifyData);
    setIsProcessing(true);
    setProgress({ current: 0, total: tracksToUpdate.length });
    setResult(null);

    const updatedTracks = [...tracks];
    const updated: Track[] = [];
    const skipped: Track[] = [];
    let processedCount = 0;

    try {
      for (const [i, track] of tracks.entries()) {
        if (track.spotifyData) continue;

        if (processedCount > 0) {
          await new Promise((resolve) => setTimeout(resolve, 200));
        }

        try {
          const query = `${track.artist} ${track.title}`.trim();
          const response = await spotifyApi.searchTracks(query, 5);

          const exactMatch = response.tracks.items.find((spotifyTrack) => isExactMatch(track, spotifyTrack));

          if (exactMatch) {
            const updatedTrack = await updateTrackWithSpotify(track, exactMatch);
            updatedTracks[i] = updatedTrack;
            updated.push(updatedTrack);
          } else {
            skipped.push(track);
          }
        } catch (error) {
          console.error(`Error updating track "${track.title}":`, error);
          skipped.push(track);
        }

        processedCount++;
        setProgress({ current: processedCount, total: tracksToUpdate.length });
      }

      if (updated.length > 0) {
        updateCurrentPlaylistTracks(updatedTracks);
        await updatePlaylist({
          ...currentPlaylist,
          tracks: updatedTracks,
        });
      }

      setResult({
        updated,
        skipped,
        total: tracksToUpdate.length,
        source: 'spotify',
      });
      setCurrentStep('result');
    } catch (error) {
      console.error('Spotify update error:', error);
      // eslint-disable-next-line no-alert
      alert('Произошла ошибка при обновлении треков в Spotify');
    } finally {
      setIsProcessing(false);
    }
  };

  // Функция обновления треков из M3U файла
  const handleM3UUpdate = async () => {
    if (!fileContent || !currentPlaylist) return;

    setIsProcessing(true);
    setProgress({ current: 0, total: tracks.length });
    setResult(null);

    try {
      const parsedPlaylist = parseM3U(fileContent);
      const m3uTracks = parsedPlaylist.tracks;

      const updatedTracks = [...tracks];
      const updated: Track[] = [];
      const skipped: Track[] = [];
      let processedCount = 0;

      for (const [i, track] of tracks.entries()) {
        // Ищем соответствующий трек в M3U файле
        const matchingM3UTrack = m3uTracks.find((m3uTrack) => {
          const trackKey = `${track.artist.toLowerCase().trim()}-${track.title.toLowerCase().trim()}`;
          const m3uKey = `${m3uTrack.artist.toLowerCase().trim()}-${m3uTrack.title.toLowerCase().trim()}`;
          return trackKey === m3uKey;
        });

        if (matchingM3UTrack?.m3uData) {
          const updatedTrack: Track = {
            ...track,
            m3uData: matchingM3UTrack.m3uData,
          };
          updatedTracks[i] = updatedTrack;
          updated.push(updatedTrack);
        } else {
          skipped.push(track);
        }

        processedCount++;
        setProgress({ current: processedCount, total: tracks.length });
      }

      if (updated.length > 0) {
        updateCurrentPlaylistTracks(updatedTracks);
        await updatePlaylist({
          ...currentPlaylist,
          tracks: updatedTracks,
        });
      }

      setResult({
        updated,
        skipped,
        total: tracks.length,
        source: 'm3u',
      });
      setCurrentStep('result');
    } catch (error) {
      console.error('M3U update error:', error);
      // eslint-disable-next-line no-alert
      alert('Произошла ошибка при обработке M3U файла');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      resetDialogState();
    }
  };

  const renderSelectStep = () => (
    <div className='space-y-6'>
      <div className='text-center'>
        <Music className='h-12 w-12 text-blue-500 mx-auto mb-4' />
        <h3 className='text-lg font-semibold mb-2'>Выберите источник данных</h3>
        <p className='text-muted-foreground'>
          Выберите, какую информацию хотите добавить к трекам плейлиста
        </p>
      </div>

      <div className='grid gap-4'>
        <div
          className='cursor-pointer hover:bg-muted/50 transition-colors border rounded-lg p-6'
          onClick={() => setCurrentStep('spotify')}
        >
          <div className='mb-4'>
            <h3 className='text-lg font-semibold flex items-center gap-2 mb-2'>
              <Music className='h-5 w-5' />
              Распознать в Spotify
            </h3>
            <p className='text-sm text-muted-foreground'>
              Найти точные совпадения треков в Spotify и связать их
            </p>
          </div>
          <div>
            <p className='text-sm text-muted-foreground'>
              Треки будут найдены по артисту и названию. Если найдено точное совпадение, трек будет связан со Spotify.
            </p>
          </div>
        </div>

        <div
          className='cursor-pointer hover:bg-muted/50 transition-colors border rounded-lg p-6'
          onClick={() => setCurrentStep('m3u')}
        >
          <div className='mb-4'>
            <h3 className='text-lg font-semibold flex items-center gap-2 mb-2'>
              <FileText className='h-5 w-5' />
              Добавить данные файлов
            </h3>
            <p className='text-sm text-muted-foreground'>
              Загрузить M3U файл и добавить информацию о путях к файлам
            </p>
          </div>
          <div>
            <p className='text-sm text-muted-foreground'>
              Загрузите M3U файл, и информация о путях к файлам будет добавлена к соответствующим трекам.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSpotifyStep = () => (
    <div className='space-y-4'>
      <div className='text-center'>
        <Music className='h-12 w-12 text-green-500 mx-auto mb-4' />
        <h3 className='text-lg font-semibold mb-2'>Распознавание в Spotify</h3>
        <p className='text-muted-foreground'>
          Поиск точных совпадений треков в Spotify API
        </p>
      </div>

      {authStatus.isAuthenticated
        ? isProcessing
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
          : (
              <div className='space-y-4'>
                <div className='text-center'>
                  <Music className='h-12 w-12 text-green-500 mx-auto mb-4' />
                  <h3 className='text-lg font-semibold mb-2'>Готов к распознаванию</h3>
                  <p className='text-muted-foreground'>
                    Найдено {tracks.filter((t) => !t.spotifyData).length} треков для распознавания
                  </p>
                </div>

                <Button
                  onClick={handleSpotifyUpdate}
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
  );

  const renderM3UStep = () => (
    <div className='space-y-4'>
      <div className='text-center'>
        <FileText className='h-12 w-12 text-blue-500 mx-auto mb-4' />
        <h3 className='text-lg font-semibold mb-2'>Загрузка M3U файла</h3>
        <p className='text-muted-foreground'>
          Загрузите M3U файл для добавления информации о путях к файлам
        </p>
      </div>

      {selectedFile
        ? isProcessing
          ? (
              <div className='text-center py-8'>
                <Loader2 className='h-12 w-12 animate-spin text-blue-500 mx-auto mb-4' />
                <h3 className='text-lg font-semibold mb-2'>Обрабатываем файл...</h3>
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
          : (
              <div className='space-y-4'>
                <div className='text-center'>
                  <FileText className='h-12 w-12 text-green-500 mx-auto mb-4' />
                  <h3 className='text-lg font-semibold mb-2'>Файл загружен</h3>
                  <p className='text-muted-foreground'>
                    {selectedFile.name} - {Math.round(selectedFile.size / 1024)} KB
                  </p>
                </div>

                <Button
                  onClick={handleM3UUpdate}
                  className='w-full'
                  size='lg'
                >
                  <FileText className='mr-2 h-4 w-4' />
                  Обработать файл
                </Button>
              </div>
            )
        : (
            <div className='space-y-4'>
              <div className='border-2 border-dashed border-gray-300 rounded-lg p-8 text-center'>
                <Upload className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                <p className='text-lg font-medium mb-2'>Выберите M3U файл</p>
                <p className='text-muted-foreground mb-4'>
                  Поддерживаются файлы .m3u и .m3u8
                </p>
                <input
                  type='file'
                  accept='.m3u,.m3u8'
                  onChange={handleFileSelect}
                  className='hidden'
                  id='m3u-file-input'
                />
                <label htmlFor='m3u-file-input'>
                  <Button variant='outline' asChild>
                    <span>Выбрать файл</span>
                  </Button>
                </label>
              </div>
            </div>
          )}
    </div>
  );

  const renderResultStep = () => {
    if (!result) return null;

    const getSourceTitle = () => {
      switch (result.source) {
        case 'spotify': {
          return 'Распознавание в Spotify завершено';
        }
        case 'm3u': {
          return 'Обработка M3U файла завершена';
        }
        default: {
          return 'Обновление завершено';
        }
      }
    };

    const getSourceDescription = () => {
      switch (result.source) {
        case 'spotify': {
          return `Распознано ${result.updated.length} из ${result.total} треков в Spotify`;
        }
        case 'm3u': {
          return `Добавлена информация о файлах для ${result.updated.length} из ${result.total} треков`;
        }
        default: {
          return `Обновлено ${result.updated.length} из ${result.total} треков`;
        }
      }
    };

    return (
      <div className='space-y-4'>
        <div className='text-center'>
          <CheckCircle className='h-12 w-12 text-green-500 mx-auto mb-4' />
          <h3 className='text-lg font-semibold mb-2'>{getSourceTitle()}</h3>
          <p className='text-muted-foreground'>
            {getSourceDescription()}
          </p>
        </div>

        {result.updated.length > 0 && (
          <div className='space-y-2'>
            <h4 className='font-medium text-green-700 flex items-center gap-2'>
              <CheckCircle className='h-4 w-4' />
              {result.source === 'spotify' ? 'Распознанные треки' : 'Треки с данными файлов'} ({result.updated.length})
            </h4>
            <ScrollArea className='h-32'>
              <div className='space-y-1'>
                {result.updated.map((track) => (
                  <div key={`updated-${track.title}-${track.artist}`} className='flex items-center gap-2 p-2 bg-green-50 rounded'>
                    <CheckCircle className='h-4 w-4 text-green-600' />
                    <span className='text-sm'>{track.artist} - {track.title}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {result.skipped.length > 0 && (
          <div className='space-y-2'>
            <h4 className='font-medium text-orange-700 flex items-center gap-2'>
              <AlertCircle className='h-4 w-4' />
              {result.source === 'spotify' ? 'Не распознанные треки' : 'Треки без данных файлов'} ({result.skipped.length})
            </h4>
            <ScrollArea className='h-32'>
              <div className='space-y-1'>
                {result.skipped.map((track) => (
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
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'select': {
        return renderSelectStep();
      }
      case 'spotify': {
        return renderSpotifyStep();
      }
      case 'm3u': {
        return renderM3UStep();
      }
      case 'result': {
        return renderResultStep();
      }
      default: {
        return renderSelectStep();
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
      <DialogTrigger asChild>
        <Button
          onClick={() => setIsOpen(true)}
          variant='outline'
          className='flex items-center gap-2'
        >
          <Music className='h-4 w-4' />
          Обновить данные
        </Button>
      </DialogTrigger>
      <DialogContent className='max-w-4xl w-[90vw] max-h-[90vh] overflow-hidden'>
        <DialogHeader>
          <DialogTitle>Обновление данных</DialogTitle>
          <DialogDescription>
            Добавьте информацию к трекам из внешних источников
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4 overflow-y-auto max-h-[calc(90vh-200px)]'>
          {/* Step indicator */}
          <div className='flex items-center justify-center space-x-2'>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep === 'select' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
            }`}
            >
              1
            </div>
            <div className='w-8 h-1 bg-gray-200' />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              ['spotify', 'm3u'].includes(currentStep) ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
            }`}
            >
              2
            </div>
            <div className='w-8 h-1 bg-gray-200' />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep === 'result' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
            }`}
            >
              3
            </div>
          </div>

          {renderCurrentStep()}
        </div>

        <div className='flex justify-between gap-2 pt-4'>
          {currentStep !== 'select' && currentStep !== 'result' && (
            <Button
              variant='outline'
              onClick={() => setCurrentStep('select')}
              disabled={isProcessing}
            >
              Назад
            </Button>
          )}
          <div className='flex-1' />
          {currentStep === 'result' && (
            <Button onClick={() => setIsOpen(false)}>
              Закрыть
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default UniversalPlaylistUpdate;
