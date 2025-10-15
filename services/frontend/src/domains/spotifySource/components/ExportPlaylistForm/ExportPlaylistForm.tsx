'use client';

import { useState, useMemo } from 'react';
import { Download, ExternalLink, Loader2 } from 'lucide-react';

import { Button } from '@/shared/components/ui/Button';
import { Checkbox } from '@/shared/components/ui/Checkbox';
import { Input } from '@/shared/components/ui/Input';
import { Label } from '@/shared/components/ui/Label';
import { Separator } from '@/shared/components/ui/Separator';
import type { ExportForm } from '@/shared/types/source';
import type { Playlist } from '@/shared/types/playlist';
import { getTracksComparison, type MergeTracksOptions, mergeTracks } from '@/shared/utils/playlist';
import { createPlaylistFromSpotify } from '@/shared/utils/spotify';
import { spotifyService } from '@/infrastructure/services/spotify';

import { useSpotifyStore } from '../../store';

type MergeOptionsWithoutSource = Omit<MergeTracksOptions, 'source'>;

const ExportPlaylistForm: ExportForm = function ({ playlist, onSuccessExport, onCancel }) {
  const { authStatus } = useSpotifyStore();
  const [error, setError] = useState<string | null>(null);
  const [exportMode, setExportMode] = useState<'new' | 'existing'>('new');
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [spotifyPlaylist, setSpotifyPlaylist] = useState<{ id: string; data: Playlist; } | null>(null);
  const [mergeOptions, setMergeOptions] = useState<MergeOptionsWithoutSource>({
    addNewTracks: true,
    removeMissingTracks: true,
    syncOrder: true,
  });
  const [uploadCover, setUploadCover] = useState(true);

  const handleMergeOptionsChange = (option: keyof MergeOptionsWithoutSource, value: boolean) => {
    setMergeOptions((prev) => ({
      ...prev,
      [option]: value,
    }));
  };

  const handlePlaylistUrlChange = async (url: string) => {
    // TODO: Добавить Debounce на ввод URL

    setPlaylistUrl(url);
    setError(null);
    setSpotifyPlaylist(null);

    if (!url.trim()) return;

    setIsLoading(true);
    try {
      const playlistInfo = await spotifyService.getPlaylistInfoByURL(url);

      if (playlistInfo.owner.id !== authStatus.user?.id) {
        throw new Error('Этот плейлист не принадлежит вашему аккаунту');
      }

      const tracks = await spotifyService.getPlaylistTracksByURL(url);

      setSpotifyPlaylist({
        id: playlistInfo.id,
        data: createPlaylistFromSpotify(playlistInfo, tracks),
      });
    } catch (error: any) {
      console.error('Error fetching playlist:', error);
      setError(error.message || 'Произошла ошибка при загрузке плейлиста');
    } finally {
      setIsLoading(false);
    }
  };

  const compTracks = useMemo(() => {
    if (!spotifyPlaylist) {
      return null;
    }

    const onlyPlaylistTracksWithSpotifyData = playlist.tracks.filter((t) => t.spotifyData);

    return getTracksComparison(spotifyPlaylist.data.tracks, onlyPlaylistTracksWithSpotifyData, 'spotify');
  }, [playlist, spotifyPlaylist]);

  const handleExport = async () => {
    if (!authStatus.isAuthenticated) {
      setError('Необходимо авторизоваться в Spotify');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (exportMode === 'new') {
        const playlistInfo = await spotifyService.createPlaylist(playlist, { uploadCover });

        onSuccessExport(
          'Плейлист успешно создан!', (
            <a
              href={`https://open.spotify.com/playlist/${playlistInfo.id}`}
              target='_blank'
              rel='noopener noreferrer'
              className='text-blue-600 hover:underline flex items-center gap-1 justify-center'
            >
              <ExternalLink className='h-4 w-4' />
              Открыть в Spotify
            </a>
          ),
        );
      } else {
        if (spotifyPlaylist) {
          const { mergedTracks } = mergeTracks(spotifyPlaylist.data.tracks, playlist.tracks, { ...mergeOptions, source: 'spotify' });
          await spotifyService.updatePlaylist(spotifyPlaylist.id, mergedTracks, playlist, { uploadCover });

          onSuccessExport('Плейлист успешно обновлен!');
        }
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const canProceedToExport = () => {
    if (exportMode === 'new') {
      return true;
    }
    return spotifyPlaylist !== null;
  };

  const ExportSettings = useMemo(() => (
    <div className='space-y-3'>
      <Label>Настройки экспорта</Label>
      <div className='space-y-2'>
        <label className='flex items-center space-x-2'>
          <Checkbox
            checked={uploadCover}
            onChange={(e) => setUploadCover(e.target.checked)}
          />
          <span className='text-sm'>
            {exportMode === 'new'
              ? 'Загрузить обложку плейлиста'
              : 'Обновить обложку плейлиста'}
          </span>
        </label>
        {!uploadCover && (
          <p className='text-xs text-muted-foreground ml-6'>
            {exportMode === 'new'
              ? 'Плейлист будет создан без обложки'
              : 'Обложка плейлиста не будет обновлена'}
          </p>
        )}
      </div>
    </div>
  ), [exportMode, uploadCover]);

  return (
    <>
      <div className='space-y-4'>
        <div className='text-center'>
          <h3 className='text-lg font-semibold mb-2'>Настройка экспорта в Spotify</h3>
          <p className='text-muted-foreground mb-6'>
            Выберите режим экспорта и настройте параметры
          </p>
        </div>

        {error && (
          <div className='p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md'>
            {error}
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

        {exportMode === 'new' && playlist.coverKey && ExportSettings}

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

            {spotifyPlaylist && compTracks && (
              <div className='space-y-3'>
                <div className='p-3 border rounded-lg'>
                  <h4 className='font-medium mb-2'>Сравнение плейлистов</h4>
                  <div className='space-y-1 text-sm'>
                    <div className='flex justify-between'>
                      <span>Новых треков:</span>
                      <span className='font-medium text-green-600'>{compTracks.addTracks.length}</span>
                    </div>
                    <div className='flex justify-between'>
                      <span>Удаляемых треков:</span>
                      <span className='font-medium text-red-600'>{compTracks.missingTracks.length}</span>
                    </div>
                    <div className='flex justify-between'>
                      <span>Общих треков:</span>
                      <span className='font-medium'>{compTracks.commonTracks.length}</span>
                    </div>
                    {compTracks.hasOrderDifference && (
                      <div className='flex justify-between'>
                        <span>Различия в порядке общих треков:</span>
                        <span className='font-medium text-orange-600'>Да</span>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                <div className='space-y-3'>
                  <Label>Параметры синхронизации</Label>
                  <div className='space-y-2'>
                    {compTracks.addTracks.length > 0 && (
                      <label className='flex items-center space-x-2'>
                        <Checkbox
                          checked={mergeOptions.addNewTracks}
                          onChange={(e) => handleMergeOptionsChange('addNewTracks', e.target.checked)}
                        />
                        <span className='text-sm'>Добавить новые треки</span>
                      </label>
                    )}
                    {compTracks.missingTracks.length > 0 && (
                      <label className='flex items-center space-x-2'>
                        <Checkbox
                          checked={mergeOptions.removeMissingTracks}
                          onChange={(e) => handleMergeOptionsChange('removeMissingTracks', e.target.checked)}
                        />
                        <span className='text-sm'>Удалить отсутствующие треки</span>
                      </label>
                    )}
                    {compTracks.addTracks.length === 0 && compTracks.missingTracks.length === 0 && (
                      <div className='text-sm text-muted-foreground p-2 bg-muted rounded'>
                        Плейлисты идентичны по составу треков
                      </div>
                    )}
                    {/* TODO: Обработать ситуацию, когда два плейлиста абсолютно идентичны */}
                    <label className='flex items-center space-x-2'>
                      <Checkbox
                        checked={mergeOptions.syncOrder}
                        onChange={(e) => handleMergeOptionsChange('syncOrder', e.target.checked)}
                      />
                      <span className='text-sm'>Синхронизировать порядок треков</span>
                    </label>
                  </div>
                </div>

                <Separator />

                {playlist.coverKey && ExportSettings}
              </div>
            )}
          </div>
        )}
      </div>
      <div className='flex justify-between gap-2 pt-4'>
        <Button
          variant='outline'
          onClick={onCancel}
          disabled={isLoading}
        >
          Назад
        </Button>
        <div className='flex-1' />
        <Button
          onClick={handleExport}
          disabled={isLoading || !canProceedToExport()}
        >
          {isLoading
            ? (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              )
            : (
                <Download className='mr-2 h-4 w-4' />
              )}
          {exportMode === 'new' ? 'Создать плейлист' : 'Обновить плейлист'}
        </Button>
      </div>
    </>
  );
};

export default ExportPlaylistForm;
