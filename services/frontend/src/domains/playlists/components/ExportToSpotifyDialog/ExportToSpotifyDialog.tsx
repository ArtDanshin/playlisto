'use client';

import { useState } from 'react';
import { Music, Loader2, ExternalLink } from 'lucide-react';

import type { Playlist, Track } from '@/shared/types';
import { spotifyApi } from '@/infrastructure/api/spotify';
import { useSpotifyStore } from '@/domains/spotifySource/store';
import { getSpotifyId } from '@/shared/utils/playlist-utils';
import { Button } from '@/shared/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/Dialog';
import { Input } from '@/shared/components/ui/Input';
import { Label } from '@/shared/components/ui/Label';
import { Checkbox } from '@/shared/components/ui/Checkbox';
import { Separator } from '@/shared/components/ui/Separator';

interface ExportToSpotifyDialogProps {
  playlist: Playlist;
  children: React.ReactNode;
}

interface SyncOptions {
  addNewTracks: boolean;
  removeMissingTracks: boolean;
  syncOrder: boolean;
}

interface SpotifyPlaylist {
  id: string;
  name: string;
  tracks: SpotifyTrack[];
}

interface SpotifyTrack {
  id: string;
  name: string;
  artist: string;
}

const extractPlaylistId = (url: string): string | null => {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    const playlistIndex = pathParts.indexOf('playlist');
    if (playlistIndex !== -1 && playlistIndex + 1 < pathParts.length) {
      return pathParts[playlistIndex + 1];
    }
  } catch {
    // Invalid URL - ignore
  }
  return null;
};

function ExportToSpotifyDialog({ playlist, children }: ExportToSpotifyDialogProps) {
  const { authStatus } = useSpotifyStore();
  const [isOpen, setIsOpen] = useState(false);
  const [exportMode, setExportMode] = useState<'new' | 'existing'>('new');
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [createdPlaylistId, setCreatedPlaylistId] = useState<string | null>(null);
  const [spotifyPlaylist, setSpotifyPlaylist] = useState<SpotifyPlaylist | null>(null);
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

  const fetchSpotifyPlaylist = async (playlistId: string): Promise<SpotifyPlaylist | null> => {
    try {
      const playlistData = await spotifyApi.getPlaylistInfo(playlistId);

      // Проверяем, что плейлист принадлежит авторизованному пользователю
      if (playlistData.owner.id !== authStatus.user?.id) {
        throw new Error('Этот плейлист не принадлежит вашему аккаунту');
      }

      const tracks = playlistData.tracks.items.map((item: any) => ({
        id: item.track.id,
        name: item.track.name,
        artist: item.track.artists[0]?.name || 'Unknown Artist',
      }));

      return {
        id: playlistData.id,
        name: playlistData.name,
        tracks,
      };
    } catch (error: any) {
      throw new Error(`Ошибка при получении плейлиста: ${error.message}`);
    }
  };

  const handlePlaylistUrlChange = async (url: string) => {
    setPlaylistUrl(url);
    setError(null);
    setSpotifyPlaylist(null);

    if (!url.trim()) return;

    const playlistId = extractPlaylistId(url);
    if (!playlistId) {
      setError('Неверный формат ссылки на плейлист Spotify');
      return;
    }

    setIsLoading(true);
    try {
      const playlist = await fetchSpotifyPlaylist(playlistId);
      setSpotifyPlaylist(playlist);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getTrackComparison = () => {
    if (!spotifyPlaylist) return null;

    // Сопоставляем треки по Spotify ID
    const appTracksWithSpotifyId = playlist.tracks.filter((t: Track) => getSpotifyId(t));
    const appSpotifyIds = new Set(appTracksWithSpotifyId.map((t: Track) => getSpotifyId(t)));
    const spotifyTrackIds = new Set(spotifyPlaylist.tracks.map((t: SpotifyTrack) => t.id));

    // Новые треки - есть в приложении, но нет в Spotify плейлисте
    const newTracks = appTracksWithSpotifyId.filter((t: Track) => !spotifyTrackIds.has(getSpotifyId(t)!));

    // Отсутствующие треки - есть в Spotify плейлисте, но нет в приложении
    const missingTracks = spotifyPlaylist.tracks.filter((t: SpotifyTrack) => !appSpotifyIds.has(t.id));

    // Общие треки - есть и в приложении, и в Spotify плейлисте
    const commonTracks = appTracksWithSpotifyId.filter((t: Track) => spotifyTrackIds.has(getSpotifyId(t)!));

    // Проверяем различия в порядке треков по Spotify ID
    const appCommonSpotifyIds = commonTracks.map((t: Track) => getSpotifyId(t));
    const spotifyCommonIds = spotifyPlaylist.tracks
      .filter((t: SpotifyTrack) => appSpotifyIds.has(t.id))
      .map((t: SpotifyTrack) => t.id);

    const hasOrderDifference = appCommonSpotifyIds.length > 0
      && JSON.stringify(appCommonSpotifyIds) !== JSON.stringify(spotifyCommonIds);

    // Если состав треков одинаковый, но порядок различается, не показываем новые/удаленные
    const hasCompositionDifference = newTracks.length > 0 || missingTracks.length > 0;
    const showOrderOnly = !hasCompositionDifference && hasOrderDifference;

    return {
      newTracks,
      missingTracks,
      commonTracks,
      totalNew: newTracks.length,
      totalMissing: missingTracks.length,
      totalCommon: commonTracks.length,
      hasOrderDifference,
      showOrderOnly,
    };
  };

  const createNewPlaylist = async (): Promise<string> => {
    const recognizedTracks = playlist.tracks.filter((track) => getSpotifyId(track));

    if (recognizedTracks.length === 0) {
      throw new Error('Нет распознанных треков для экспорта');
    }

    // Создаем новый плейлист
    const playlistData = await spotifyApi.apiCall('/me/playlists', {
      method: 'POST',
      body: JSON.stringify({
        name: playlist.name,
        description: `Экспортировано из Playlisto - ${new Date().toLocaleDateString()}`,
        public: false,
      }),
    });

    // Добавляем треки в плейлист
    const trackUris = recognizedTracks.map((track) => `spotify:track:${getSpotifyId(track)}`);

    await spotifyApi.apiCall(`/playlists/${playlistData.id}/tracks`, {
      method: 'POST',
      body: JSON.stringify({
        uris: trackUris,
      }),
    });

    return playlistData.id;
  };

  const updateExistingPlaylist = async (): Promise<void> => {
    if (!spotifyPlaylist) return;

    const recognizedTracks = playlist.tracks.filter((track) => getSpotifyId(track));
    const comparison = getTrackComparison();

    if (!comparison) return;

    let finalTracks = [...spotifyPlaylist.tracks];

    if (syncOptions.syncOrder) {
      // Синхронизируем порядок как в приложении по Spotify ID

      finalTracks = recognizedTracks.map((appTrack) => {
        const existingTrack = spotifyPlaylist.tracks.find((spotifyTrack) => spotifyTrack.id === getSpotifyId(appTrack));

        if (existingTrack) {
          return existingTrack;
        }

        // Новый трек - будет добавлен в конец
        return {
          id: getSpotifyId(appTrack)!,
          name: appTrack.title,
          artist: appTrack.artist,
        };
      });

      // Добавляем треки, которых нет в приложении, в конец
      if (syncOptions.addNewTracks) {
        const appSpotifyIds = new Set(recognizedTracks.map((t) => getSpotifyId(t)));
        const missingTracks = spotifyPlaylist.tracks.filter((spotifyTrack) => !appSpotifyIds.has(spotifyTrack.id));
        finalTracks.push(...missingTracks);
      }
    } else {
      // Простое объединение
      if (syncOptions.addNewTracks) {
        recognizedTracks.forEach((appTrack) => {
          const exists = spotifyPlaylist.tracks.some((spotifyTrack) => spotifyTrack.id === getSpotifyId(appTrack));

          if (!exists) {
            finalTracks.push({
              id: getSpotifyId(appTrack)!,
              name: appTrack.title,
              artist: appTrack.artist,
            });
          }
        });
      }
    }

    if (syncOptions.removeMissingTracks) {
      const appSpotifyIds = new Set(recognizedTracks.map((t) => getSpotifyId(t)));
      finalTracks = finalTracks.filter((spotifyTrack) => appSpotifyIds.has(spotifyTrack.id));
    }

    // Обновляем плейлист
    const trackUris = finalTracks.map((track) => `spotify:track:${track.id}`);

    await spotifyApi.apiCall(`/playlists/${spotifyPlaylist.id}/tracks`, {
      method: 'PUT',
      body: JSON.stringify({
        uris: trackUris,
      }),
    });
  };

  const resetDialogState = () => {
    setExportMode('new');
    setPlaylistUrl('');
    setError(null);
    setSuccessMessage(null);
    setCreatedPlaylistId(null);
    setSpotifyPlaylist(null);
    setSyncOptions({
      addNewTracks: true,
      removeMissingTracks: true,
      syncOrder: true,
    });
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      // При открытии диалога очищаем только сообщения об успехе/ошибках
      setError(null);
      setSuccessMessage(null);
      setCreatedPlaylistId(null);
    } else {
      // Очищаем состояние только при закрытии диалога
      resetDialogState();
    }
  };

  const handleExport = async () => {
    if (!authStatus.isAuthenticated) {
      setError('Необходимо авторизоваться в Spotify');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (exportMode === 'new') {
        const playlistId = await createNewPlaylist();
        setCreatedPlaylistId(playlistId);
        setSuccessMessage('Плейлист успешно создан!');
      } else {
        await updateExistingPlaylist();
        setSuccessMessage('Плейлист успешно обновлен!');
      }

      // Не закрываем диалог сразу, чтобы пользователь увидел результат
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const comparison = getTrackComparison();

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className='max-w-2xl max-h-[80vh] overflow-hidden'>
        <DialogHeader>
          <DialogTitle>Экспорт в Spotify</DialogTitle>
          <DialogDescription>
            Создайте новый плейлист в Spotify или обновите существующий
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          {error && (
            <div className='text-sm text-red-600 bg-red-50 p-3 rounded'>
              {error}
            </div>
          )}

          {successMessage && (
            <div className='text-sm text-green-600 bg-green-50 p-3 rounded'>
              {successMessage}
              {createdPlaylistId && (
                <div className='mt-2'>
                  <a
                    href={`https://open.spotify.com/playlist/${createdPlaylistId}`}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-blue-600 hover:underline flex items-center gap-1'
                  >
                    <ExternalLink className='h-3 w-3' />
                    Открыть в Spotify
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Export Mode Selection */}
          <div className='space-y-3'>
            <Label>Режим экспорта</Label>
            <div className='flex gap-2'>
              <Button
                variant={exportMode === 'new' ? 'default' : 'outline'}
                onClick={() => setExportMode('new')}
                className='flex-1'
              >
                Создать новый плейлист
              </Button>
              <Button
                variant={exportMode === 'existing' ? 'default' : 'outline'}
                onClick={() => setExportMode('existing')}
                className='flex-1'
              >
                Обновить существующий
              </Button>
            </div>
          </div>

          {exportMode === 'existing' && (
            <div className='space-y-3'>
              <div className='space-y-2'>
                <Label htmlFor='playlist-url'>Ссылка на плейлист Spotify</Label>
                <Input
                  id='playlist-url'
                  value={playlistUrl}
                  onChange={(e) => handlePlaylistUrlChange(e.target.value)}
                  placeholder='https://open.spotify.com/playlist/...'
                />
                <p className='text-xs text-muted-foreground'>
                  Вставьте ссылку на плейлист, который хотите обновить
                </p>
              </div>

              {isLoading && (
                <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                  <Loader2 className='h-4 w-4 animate-spin' />
                  Загружаем информацию о плейлисте...
                </div>
              )}

              {spotifyPlaylist && comparison && (
                <div className='space-y-3'>
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
                      {comparison.hasOrderDifference && (
                        <div className='flex justify-between'>
                          <span>Различия в порядке:</span>
                          <span className='font-medium text-orange-600'>Да</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div className='space-y-3'>
                    <Label>Параметры синхронизации</Label>
                    <div className='space-y-2'>
                      {comparison.totalNew > 0 && (
                        <label className='flex items-center space-x-2'>
                          <Checkbox
                            checked={syncOptions.addNewTracks}
                            onChange={(e) => handleSyncOptionsChange('addNewTracks', e.target.checked)}
                          />
                          <span className='text-sm'>Добавить новые треки ({comparison.totalNew})</span>
                        </label>
                      )}
                      {comparison.totalMissing > 0 && (
                        <label className='flex items-center space-x-2'>
                          <Checkbox
                            checked={syncOptions.removeMissingTracks}
                            onChange={(e) => handleSyncOptionsChange('removeMissingTracks', e.target.checked)}
                          />
                          <span className='text-sm'>Удалить отсутствующие треки ({comparison.totalMissing})</span>
                        </label>
                      )}
                      {comparison.totalNew === 0 && comparison.totalMissing === 0 && (
                        <div className='text-sm text-muted-foreground p-2 bg-muted rounded'>
                          Плейлисты идентичны по составу треков
                        </div>
                      )}
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
              )}
            </div>
          )}

          {/* Export Button */}
          <div className='flex justify-end gap-2 pt-4'>
            <Button variant='outline' onClick={() => setIsOpen(false)}>
              Отмена
            </Button>
            <Button
              onClick={handleExport}
              disabled={isLoading || (exportMode === 'existing' && !spotifyPlaylist)}
            >
              {isLoading
                ? (
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  )
                : (
                    <Music className='mr-2 h-4 w-4' />
                  )}
              {exportMode === 'new' ? 'Создать плейлист' : 'Обновить плейлист'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ExportToSpotifyDialog;
