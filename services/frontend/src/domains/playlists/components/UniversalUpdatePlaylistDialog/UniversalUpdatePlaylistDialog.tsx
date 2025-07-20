'use client';

import { useState, useRef } from 'react';
import {
  Upload, FileAudio, RefreshCw, Music, ArrowLeft,
} from 'lucide-react';

import type { Playlist, Track } from '@/shared/types';
import { parseM3U } from '@/shared/utils/m3u-parser';
import { createTrackKey } from '@/shared/utils/playlist-utils';
import { Button } from '@/shared/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/Dialog';
import { Checkbox } from '@/shared/components/ui/Checkbox';
import { Label } from '@/shared/components/ui/Label';
import { Separator } from '@/shared/components/ui/Separator';
import { Input } from '@/shared/components/ui/Input';
import { playlistDB } from '@/infrastructure/storage/indexed-db';
import { spotifyApi } from '@/infrastructure/api/spotify-api';
import { useSpotifyStore } from '@/domains/spotify/store/spotify-store';

import { usePlaylistStore } from '../../store/playlist-store';

interface UniversalUpdatePlaylistDialogProps {
  currentPlaylist: Playlist;
  onPlaylistUpdated: (updatedPlaylist: Playlist) => void;
  children: React.ReactNode;
}

interface SyncOptions {
  addNewTracks: boolean;
  removeMissingTracks: boolean;
  syncOrder: boolean;
}

type SourceType = 'file' | 'spotify';

const extractPlaylistId = (url: string): string | null => {
  const match = url.match(/playlist\/([a-zA-Z0-9]+)/);
  return match ? match[1] : null;
};

const convertSpotifyTrackToTrack = async (spotifyTrack: any, position: number): Promise<Track> => {
  const track: Track = {
    title: spotifyTrack.track.name,
    artist: spotifyTrack.track.artists[0]?.name || 'Unknown Artist',
    album: spotifyTrack.track.album?.name || '',
    position,
    coverKey: '',
    spotifyData: {
      id: spotifyTrack.track.id,
      title: spotifyTrack.track.name,
      artist: spotifyTrack.track.artists[0]?.name || 'Unknown Artist',
      album: spotifyTrack.track.album?.name || '',
      coverUrl: spotifyTrack.track.album?.images?.[0]?.url || '',
      duration: spotifyTrack.track.duration_ms || 0,
    },
  };

  // Сохраняем обложку в базу данных
  if (track.spotifyData?.coverUrl) {
    try {
      const response = await fetch(track.spotifyData.coverUrl);
      const blob = await response.blob();
      const reader = new FileReader();

      return new Promise((resolve) => {
        reader.onloadend = async () => {
          const base64 = reader.result as string;
          const coverKey = `spotify_${track.spotifyData!.id}`;
          await playlistDB.addCover(coverKey, base64);
          track.coverKey = coverKey;
          resolve(track);
        };
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Failed to save cover:', error);
      return track;
    }
  }

  return track;
};

// Функция для получения всех треков плейлиста с пагинацией
const getAllPlaylistTracks = async (playlistId: string): Promise<any[]> => {
  const allTracks: any[] = [];
  let offset = 0;
  const limit = 50; // Максимальное количество треков за запрос согласно Spotify API

  while (true) {
    const response = await spotifyApi.getPlaylistTracks(playlistId, limit, offset);

    if (!response.items || response.items.length === 0) {
      break; // Больше треков нет
    }

    allTracks.push(...response.items);
    offset += limit;

    // Если получили меньше треков чем limit, значит это последняя страница
    if (response.items.length < limit) {
      break;
    }
  }

  return allTracks;
};

function UniversalUpdatePlaylistDialog({ currentPlaylist, onPlaylistUpdated, children }: UniversalUpdatePlaylistDialogProps) {
  const { setNewTracks } = usePlaylistStore();
  const { authStatus } = useSpotifyStore();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSource, setSelectedSource] = useState<SourceType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedPlaylist, setUploadedPlaylist] = useState<Playlist | null>(null);
  const [syncOptions, setSyncOptions] = useState<SyncOptions>({
    addNewTracks: true,
    removeMissingTracks: true,
    syncOrder: true,
  });
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file extension
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.m3u') && !fileName.endsWith('.m3u8')) {
      setError('Пожалуйста, выберите файл формата .m3u или .m3u8');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const content = await file.text();
      const playlist = parseM3U(content);

      // Update playlist name with filename
      playlist.name = file.name.replace(/\.[^/.]+$/, '');

      setUploadedPlaylist(playlist);
    } catch (error_) {
      setError('Ошибка при чтении файла. Пожалуйста, попробуйте еще раз.');
      console.error('Error parsing M3U file:', error_);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpotifyImport = async () => {
    if (!spotifyUrl.trim()) {
      setError('Пожалуйста, введите ссылку на плейлист Spotify');
      return;
    }

    const playlistId = extractPlaylistId(spotifyUrl);
    if (!playlistId) {
      setError('Неверный формат ссылки на плейлист Spotify');
      return;
    }

    if (!authStatus.isAuthenticated) {
      setError('Необходимо авторизоваться в Spotify');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Получаем информацию о плейлисте
      const playlistData = await spotifyApi.getPlaylist(playlistId);

      // Проверяем, что плейлист доступен
      if (!playlistData) {
        throw new Error('Плейлист не найден или недоступен');
      }

      // Получаем все треки плейлиста с пагинацией
      const allTracks = await getAllPlaylistTracks(playlistId);

      // Конвертируем треки
      const tracks: Track[] = [];
      for (const [i, spotifyTrack] of allTracks.entries()) {
        if (spotifyTrack.track) {
          const track = await convertSpotifyTrackToTrack(spotifyTrack, i + 1);
          tracks.push(track);
        }
      }

      const playlist: Playlist = {
        name: playlistData.name,
        order: 0,
        tracks,
      };

      setUploadedPlaylist(playlist);
    } catch (error: any) {
      setError(error.message || 'Ошибка при импорте плейлиста');
      console.error('Spotify playlist import error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSyncOptionsChange = (option: keyof SyncOptions, value: boolean) => {
    setSyncOptions((prev) => ({
      ...prev,
      [option]: value,
    }));
  };

  // Создает ключ для сопоставления треков в зависимости от источника
  const createTrackKeyForSource = (track: Track): string => {
    if (selectedSource === 'spotify' && track.spotifyData?.id) {
      // Для Spotify используем spotifyData.id если он есть
      return track.spotifyData.id;
    }
    // Для файлов и других случаев используем artist-title
    return createTrackKey(track);
  };

  const mergePlaylists = (existing: Playlist, uploaded: Playlist): Playlist => {
    const existingTracks = [...existing.tracks];
    const uploadedTracks = [...uploaded.tracks];

    // Создаем Map для быстрого поиска треков по ключу
    const existingTracksMap = new Map<string, Track>();
    const uploadedTracksMap = new Map<string, Track>();

    existingTracks.forEach((track) => {
      const trackKey = createTrackKeyForSource(track);
      existingTracksMap.set(trackKey, track);
    });

    uploadedTracks.forEach((track) => {
      const trackKey = createTrackKeyForSource(track);
      uploadedTracksMap.set(trackKey, track);
    });

    let mergedTracks: Track[] = [];

    if (syncOptions.syncOrder) {
      // Синхронизируем порядок как в загруженном плейлисте
      mergedTracks = uploadedTracks.map((uploadedTrack, index) => {
        const trackKey = createTrackKeyForSource(uploadedTrack);
        const existingTrack = existingTracksMap.get(trackKey);
        if (existingTrack) {
          // Сохраняем существующие данные (Spotify, обложки и т.д.)
          return {
            ...uploadedTrack,
            position: index + 1,
            spotifyData: existingTrack.spotifyData,
            coverKey: existingTrack.coverKey,
            album: existingTrack.album,
            m3uData: existingTrack.m3uData,
          };
        }
        // Новый трек
        return {
          ...uploadedTrack,
          position: index + 1,
        };
      });

      // Добавляем треки, которых нет в загруженном плейлисте, в конец
      if (syncOptions.addNewTracks) {
        const missingTracks = existingTracks.filter((existingTrack) => {
          const trackKey = createTrackKeyForSource(existingTrack);
          return !uploadedTracksMap.has(trackKey);
        });
        const missingTracksWithUpdatedPositions = missingTracks.map((track, index) => ({
          ...track,
          position: mergedTracks.length + index + 1,
        }));
        mergedTracks.push(...missingTracksWithUpdatedPositions);
      }
    } else {
      // Простое объединение без изменения порядка
      mergedTracks = [...existingTracks];

      if (syncOptions.addNewTracks) {
        // Добавляем новые треки в конец
        uploadedTracks.forEach((uploadedTrack) => {
          const trackKey = createTrackKeyForSource(uploadedTrack);
          if (existingTracksMap.has(trackKey)) {
            // Обновляем существующий трек данными из загруженного источника
            const existingTrackIndex = mergedTracks.findIndex((t) => createTrackKeyForSource(t) === trackKey);
            if (existingTrackIndex !== -1) {
              const existingTrack = mergedTracks[existingTrackIndex];
              mergedTracks[existingTrackIndex] = {
                ...existingTrack,
                ...uploadedTrack,
                // Сохраняем данные внешних сервисов
                spotifyData: existingTrack.spotifyData || uploadedTrack.spotifyData,
                m3uData: existingTrack.m3uData || uploadedTrack.m3uData,
                coverKey: existingTrack.coverKey || uploadedTrack.coverKey,
              };
            }
          } else {
            mergedTracks.push({
              ...uploadedTrack,
              position: mergedTracks.length + 1,
            });
          }
        });
      }
    }

    if (syncOptions.removeMissingTracks) {
      // Удаляем треки, которых нет в загруженном плейлисте
      mergedTracks = mergedTracks.filter((track) => {
        const trackKey = createTrackKeyForSource(track);
        return uploadedTracksMap.has(trackKey);
      });
    }

    return {
      ...existing,
      tracks: mergedTracks,
    };
  };

  const resetDialogState = () => {
    setUploadedPlaylist(null);
    setError(null);
    setIsLoading(false);
    setSelectedSource(null);
    setSpotifyUrl('');
    setSyncOptions({
      addNewTracks: true,
      removeMissingTracks: true,
      syncOrder: true,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleBackToSourceSelection = () => {
    setSelectedSource(null);
    setUploadedPlaylist(null);
    setError(null);
    setSpotifyUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getCurrentStep = () => {
    if (!selectedSource) return 1;
    if (selectedSource && !uploadedPlaylist) return 2;
    return 3;
  };

  const getStepDescription = () => {
    const step = getCurrentStep();
    switch (step) {
      case 1: {
        return 'Выберите источник для обновления плейлиста';
      }
      case 2: {
        return selectedSource === 'file'
          ? 'Загрузите файл M3U для обновления'
          : 'Введите ссылку на плейлист Spotify';
      }
      case 3: {
        return 'Настройте параметры синхронизации';
      }
      default: {
        return '';
      }
    }
  };

  const handleUpdatePlaylist = () => {
    if (!uploadedPlaylist) return;

    const updatedPlaylist = mergePlaylists(currentPlaylist, uploadedPlaylist);

    // Определяем новые треки для подсветки
    const existingTrackKeys = new Set(currentPlaylist.tracks.map((t) => createTrackKeyForSource(t)));
    const newTrackKeys = updatedPlaylist.tracks
      .filter((t) => !existingTrackKeys.has(createTrackKeyForSource(t)))
      .map((t) => createTrackKey(t)); // Для подсветки используем обычный ключ

    // Устанавливаем новые треки в store для подсветки
    setNewTracks(newTrackKeys);

    onPlaylistUpdated(updatedPlaylist);
    setIsOpen(false);
    resetDialogState();
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      resetDialogState();
    }
  };

  const getTrackComparison = () => {
    if (!uploadedPlaylist) return null;

    const existingTrackKeys = new Set(currentPlaylist.tracks.map((t) => createTrackKeyForSource(t)));
    const uploadedTrackKeys = new Set(uploadedPlaylist.tracks.map((t) => createTrackKeyForSource(t)));

    const newTracks = uploadedPlaylist.tracks.filter((t) => {
      const trackKey = createTrackKeyForSource(t);
      return !existingTrackKeys.has(trackKey);
    });

    const missingTracks = currentPlaylist.tracks.filter((t) => {
      const trackKey = createTrackKeyForSource(t);
      return !uploadedTrackKeys.has(trackKey);
    });

    const commonTracks = currentPlaylist.tracks.filter((t) => {
      const trackKey = createTrackKeyForSource(t);
      return uploadedTrackKeys.has(trackKey);
    });

    return {
      newTracks,
      missingTracks,
      commonTracks,
      totalNew: newTracks.length,
      totalMissing: missingTracks.length,
      totalCommon: commonTracks.length,
    };
  };

  const comparison = getTrackComparison();

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className='max-w-2xl max-h-[80vh] overflow-hidden'>
        <DialogHeader>
          <DialogTitle>Обновить плейлист</DialogTitle>
          <DialogDescription>
            {getStepDescription()}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className='flex items-center gap-2 mb-4'>
          <div className='flex items-center gap-2'>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
              getCurrentStep() >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}
            >
              1
            </div>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
              getCurrentStep() >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}
            >
              2
            </div>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
              getCurrentStep() >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}
            >
              3
            </div>
          </div>
          <span className='text-sm text-muted-foreground'>
            Шаг {getCurrentStep()} из 3
          </span>
        </div>

        <div className='space-y-4'>
          {error && (
            <div className='text-sm text-red-600 bg-red-50 p-3 rounded'>
              {error}
            </div>
          )}

          {/* Back Button */}
          {selectedSource && (
            <Button
              variant='ghost'
              size='sm'
              onClick={handleBackToSourceSelection}
              disabled={isLoading}
              className='mb-2'
            >
              <ArrowLeft className='mr-2 h-4 w-4' />
              Назад к выбору источника
            </Button>
          )}

          {/* Source Selection */}
          {!selectedSource && (
            <div className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                {/* File Source */}
                <Button
                  variant='outline'
                  className='h-24 flex flex-col items-center justify-center gap-2 p-4'
                  onClick={() => setSelectedSource('file')}
                >
                  <FileAudio className='h-8 w-8 text-muted-foreground' />
                  <div className='text-center'>
                    <div className='font-medium'>Файл M3U</div>
                    <div className='text-sm text-muted-foreground leading-relaxed whitespace-normal break-words'>
                      Загрузить из .m3u или .m3u8 файла
                    </div>
                  </div>
                </Button>

                {/* Spotify Source */}
                <Button
                  variant='outline'
                  className='h-24 flex flex-col items-center justify-center gap-2 p-4'
                  onClick={() => setSelectedSource('spotify')}
                >
                  <Music className='h-8 w-8 text-green-600' />
                  <div className='text-center'>
                    <div className='font-medium'>Spotify</div>
                    <div className='text-sm text-muted-foreground leading-relaxed whitespace-normal break-words'>
                      Импортировать по ссылке на плейлист
                    </div>
                  </div>
                </Button>
              </div>
            </div>
          )}

          {/* File Upload */}
          {selectedSource === 'file' && (
            <div className='space-y-4'>
              <div className='flex flex-col items-center justify-center p-6 border-2 border-dashed border-muted-foreground/25 rounded-lg'>
                <FileAudio className='h-12 w-12 text-muted-foreground mb-4' />
                <p className='text-sm text-muted-foreground mb-4 text-center'>
                  Поддерживаемые форматы: .m3u, .m3u8
                </p>
                <Button
                  onClick={handleUploadClick}
                  disabled={isLoading}
                  className='w-full'
                >
                  {isLoading
                    ? (
                        <div className='flex items-center'>
                          <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2' />
                          Загрузка...
                        </div>
                      )
                    : (
                        <div className='flex items-center'>
                          <Upload className='mr-2 h-4 w-4' />
                          Выбрать файл
                        </div>
                      )}
                </Button>
                <input
                  ref={fileInputRef}
                  type='file'
                  accept='.m3u,.m3u8'
                  onChange={handleFileSelect}
                  className='hidden'
                />
              </div>
            </div>
          )}

          {/* Spotify Import */}
          {selectedSource === 'spotify' && (
            <div className='space-y-4'>
              {!authStatus.isAuthenticated && (
                <div className='flex items-center gap-2 p-3 text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-md'>
                  <span>Для импорта из Spotify необходимо авторизоваться</span>
                </div>
              )}

              <div className='space-y-2'>
                <Label htmlFor='spotify-url'>Ссылка на плейлист Spotify</Label>
                <div className='flex gap-2'>
                  <Input
                    id='spotify-url'
                    placeholder='https://open.spotify.com/playlist/...'
                    value={spotifyUrl}
                    onChange={(e) => setSpotifyUrl(e.target.value)}
                    disabled={isLoading}
                  />
                  <Button
                    onClick={handleSpotifyImport}
                    disabled={isLoading || !authStatus.isAuthenticated}
                  >
                    {isLoading
                      ? (
                          <div className='flex items-center'>
                            <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2' />
                            Импорт...
                          </div>
                        )
                      : (
                          <div className='flex items-center'>
                            <Music className='mr-2 h-4 w-4' />
                            Импортировать
                          </div>
                        )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Uploaded Playlist Info */}
          {uploadedPlaylist && comparison && (
            <>
              <Separator />

              <div className='space-y-3'>
                <div className='flex items-center gap-2'>
                  {selectedSource === 'file'
                    ? (
                        <FileAudio className='h-4 w-4' />
                      )
                    : (
                        <Music className='h-4 w-4' />
                      )}
                  <span className='font-medium'>Загруженный плейлист: {uploadedPlaylist.name}</span>
                </div>

                <div className='p-3 border rounded-lg'>
                  <h4 className='font-medium mb-2'>Сравнение плейлистов</h4>
                  <div className='space-y-1 text-sm'>
                    <div className='flex justify-between'>
                      <span>Новых треков:</span>
                      <span className='font-medium text-green-600'>{comparison.totalNew}</span>
                    </div>
                    <div className='flex justify-between'>
                      <span>Удаляемых треков:</span>
                      <span className='font-medium text-red-600'>{comparison.totalMissing}</span>
                    </div>
                    <div className='flex justify-between'>
                      <span>Общих треков:</span>
                      <span className='font-medium'>{comparison.totalCommon}</span>
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
            </>
          )}

          {/* Action Buttons */}
          <div className='flex justify-end gap-2 pt-4'>
            <Button variant='outline' onClick={() => handleOpenChange(false)}>
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
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default UniversalUpdatePlaylistDialog;
