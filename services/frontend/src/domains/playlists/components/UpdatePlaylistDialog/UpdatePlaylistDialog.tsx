'use client';

import { useState, useRef } from 'react';
import { Upload, FileAudio, RefreshCw } from 'lucide-react';

import type { ParsedPlaylist, Track } from '@/shared/utils/m3u-parser';
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
import { Checkbox } from '@/shared/components/ui/Checkbox';
import { Label } from '@/shared/components/ui/Label';
import { Separator } from '@/shared/components/ui/Separator';

interface UpdatePlaylistDialogProps {
  currentPlaylist: ParsedPlaylist;
  onPlaylistUpdated: (updatedPlaylist: ParsedPlaylist) => void;
  children: React.ReactNode;
}

interface SyncOptions {
  addNewTracks: boolean;
  removeMissingTracks: boolean;
  syncOrder: boolean;
}

const createTrackKey = (track: Track): string => {
  const artist = track.artist?.toLowerCase().trim() || 'unknown artist';
  const title = track.title?.toLowerCase().trim() || 'unknown title';
  return `${artist} - ${title}`;
};

function UpdatePlaylistDialog({ currentPlaylist, onPlaylistUpdated, children }: UpdatePlaylistDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedPlaylist, setUploadedPlaylist] = useState<ParsedPlaylist | null>(null);
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

  const mergePlaylists = (existing: ParsedPlaylist, uploaded: ParsedPlaylist): ParsedPlaylist => {
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
      mergedTracks = uploadedTracks.map((uploadedTrack) => {
        const trackKey = createTrackKey(uploadedTrack);
        const existingTrack = existingTracksMap.get(trackKey);
        if (existingTrack) {
          // Сохраняем существующие данные (Spotify, обложки и т.д.)
          return {
            ...uploadedTrack,
            spotifyId: existingTrack.spotifyId,
            spotifyData: existingTrack.spotifyData,
            coverKey: existingTrack.coverKey,
          };
        }
        // Помечаем как новый трек (только для отображения)
        return {
          ...uploadedTrack,
          isNew: true,
        };
      });

      // Добавляем треки, которых нет в загруженном плейлисте, в конец
      if (syncOptions.addNewTracks) {
        const missingTracks = existingTracks.filter((existingTrack) => {
          const trackKey = createTrackKey(existingTrack);
          return !uploadedTracksMap.has(trackKey);
        });
        mergedTracks.push(...missingTracks);
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
              isNew: true,
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

  const handleUpdatePlaylist = () => {
    if (!uploadedPlaylist) return;

    const updatedPlaylist = mergePlaylists(currentPlaylist, uploadedPlaylist);
    onPlaylistUpdated(updatedPlaylist);
    setIsOpen(false);
    setUploadedPlaylist(null);
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Загрузить обновленный плейлист</DialogTitle>
          <DialogDescription>
            Выберите файл формата M3U или M3U8 для обновления плейлиста &quot;{currentPlaylist.name}&quot;.
            Треки сопоставляются по исполнителю и названию.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          {error && (
            <div className='p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md'>
              {error}
            </div>
          )}

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
          </div>

          {uploadedPlaylist && comparison && (
            <>
              <Separator />

              <div className='space-y-3'>
                <h4 className='text-sm font-medium'>Опции синхронизации:</h4>

                <div className='space-y-2'>
                  <div className='flex items-center space-x-2'>
                    <Checkbox
                      id='addNewTracks'
                      checked={syncOptions.addNewTracks}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSyncOptionsChange('addNewTracks', e.target.checked)}
                    />
                    <Label htmlFor='addNewTracks' className='text-sm'>
                      Добавить новые треки ({comparison.totalNew})
                    </Label>
                  </div>

                  <div className='flex items-center space-x-2'>
                    <Checkbox
                      id='removeMissingTracks'
                      checked={syncOptions.removeMissingTracks}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSyncOptionsChange('removeMissingTracks', e.target.checked)}
                    />
                    <Label htmlFor='removeMissingTracks' className='text-sm'>
                      Удалить отсутствующие треки ({comparison.totalMissing})
                    </Label>
                  </div>

                  <div className='flex items-center space-x-2'>
                    <Checkbox
                      id='syncOrder'
                      checked={syncOptions.syncOrder}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSyncOptionsChange('syncOrder', e.target.checked)}
                    />
                    <Label htmlFor='syncOrder' className='text-sm'>
                      Синхронизировать порядок треков
                    </Label>
                  </div>
                </div>

                <div className='text-xs text-muted-foreground space-y-1'>
                  <p>• Новых треков: {comparison.totalNew}</p>
                  <p>• Отсутствующих треков: {comparison.totalMissing}</p>
                  <p>• Общих треков: {comparison.totalCommon}</p>
                </div>
              </div>

              <div className='flex justify-end gap-2 pt-4'>
                <Button variant='outline' onClick={() => setIsOpen(false)}>
                  Отмена
                </Button>
                <Button onClick={handleUpdatePlaylist}>
                  <RefreshCw className='mr-2 h-4 w-4' />
                  Обновить плейлист
                </Button>
              </div>
            </>
          )}
        </div>

        <input
          ref={fileInputRef}
          type='file'
          accept='.m3u,.m3u8'
          onChange={handleFileSelect}
          className='hidden'
        />
      </DialogContent>
    </Dialog>
  );
}

export default UpdatePlaylistDialog;
