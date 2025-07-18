'use client';

import { useState, useRef } from 'react';
import { Upload, FileAudio, RefreshCw } from 'lucide-react';

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

import { usePlaylistStore } from '../../store/playlist-store';

interface UpdatePlaylistDialogProps {
  currentPlaylist: Playlist;
  onPlaylistUpdated: (updatedPlaylist: Playlist) => void;
  children: React.ReactNode;
}

interface SyncOptions {
  addNewTracks: boolean;
  removeMissingTracks: boolean;
  syncOrder: boolean;
}

function UpdatePlaylistDialog({ currentPlaylist, onPlaylistUpdated, children }: UpdatePlaylistDialogProps) {
  const { setNewTracks } = usePlaylistStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedPlaylist, setUploadedPlaylist] = useState<Playlist | null>(null);
  const [syncOptions, setSyncOptions] = useState<SyncOptions>({
    addNewTracks: true,
    removeMissingTracks: true,
    syncOrder: true,
  });
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

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSyncOptionsChange = (option: keyof SyncOptions, value: boolean) => {
    setSyncOptions((prev) => ({
      ...prev,
      [option]: value,
    }));
  };

  const mergePlaylists = (existing: Playlist, uploaded: Playlist): Playlist => {
    const existingTracks = [...existing.tracks];
    const uploadedTracks = [...uploaded.tracks];

    // Создаем Map для быстрого поиска треков по ключу (исполнитель + название)
    const existingTracksMap = new Map<string, Track>();
    const uploadedTracksMap = new Map<string, Track>();

    existingTracks.forEach((track) => {
      const trackKey = createTrackKey(track);
      existingTracksMap.set(trackKey, track);
    });

    uploadedTracks.forEach((track) => {
      const trackKey = createTrackKey(track);
      uploadedTracksMap.set(trackKey, track);
    });

    let mergedTracks: Track[] = [];

    if (syncOptions.syncOrder) {
      // Синхронизируем порядок как в загруженном плейлисте
      mergedTracks = uploadedTracks.map((uploadedTrack, index) => {
        const trackKey = createTrackKey(uploadedTrack);
        const existingTrack = existingTracksMap.get(trackKey);
        if (existingTrack) {
          // Сохраняем существующие данные (Spotify, обложки и т.д.)
          return {
            ...uploadedTrack,
            position: index + 1, // Обновляем позицию
            spotifyData: existingTrack.spotifyData,
            coverKey: existingTrack.coverKey,
            album: existingTrack.album,
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
          const trackKey = createTrackKey(existingTrack);
          return !uploadedTracksMap.has(trackKey);
        });
        // Обновляем позиции для недостающих треков
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
          const trackKey = createTrackKey(uploadedTrack);
          if (!existingTracksMap.has(trackKey)) {
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
        const trackKey = createTrackKey(track);
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
    setSyncOptions({
      addNewTracks: true,
      removeMissingTracks: true,
      syncOrder: true,
    });
    // Сбрасываем input файла
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpdatePlaylist = () => {
    if (!uploadedPlaylist) return;

    const updatedPlaylist = mergePlaylists(currentPlaylist, uploadedPlaylist);

    // Определяем новые треки для подсветки
    const existingTrackKeys = new Set(currentPlaylist.tracks.map((t) => createTrackKey(t)));
    const newTrackKeys = updatedPlaylist.tracks
      .filter((t) => !existingTrackKeys.has(createTrackKey(t)))
      .map((t) => createTrackKey(t));

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

    const existingTrackKeys = new Set(currentPlaylist.tracks.map((t) => createTrackKey(t)));
    const uploadedTrackKeys = new Set(uploadedPlaylist.tracks.map((t) => createTrackKey(t)));

    const newTracks = uploadedPlaylist.tracks.filter((t) => {
      const trackKey = createTrackKey(t);
      return !existingTrackKeys.has(trackKey);
    });

    const missingTracks = currentPlaylist.tracks.filter((t) => {
      const trackKey = createTrackKey(t);
      return !uploadedTrackKeys.has(trackKey);
    });

    const commonTracks = currentPlaylist.tracks.filter((t) => {
      const trackKey = createTrackKey(t);
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
            Загрузите новый M3U файл для обновления плейлиста &quot;{currentPlaylist.name}&quot;
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          {error && (
            <div className='text-sm text-red-600 bg-red-50 p-3 rounded'>
              {error}
            </div>
          )}

          {/* File Upload */}
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

          {/* Uploaded Playlist Info */}
          {uploadedPlaylist && comparison && (
            <>
              <Separator />

              <div className='space-y-3'>
                <div className='flex items-center gap-2'>
                  <FileAudio className='h-4 w-4' />
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

export default UpdatePlaylistDialog;
