'use client';

import { useState } from 'react';
import {
  Music,
  Loader2,
  ExternalLink,
  FileText,
  Download,
} from 'lucide-react';

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

interface UniversalExportDialogProps {
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

type ExportTarget = 'spotify' | 'file';
type ExportStep = 'select' | 'configure' | 'export' | 'result';

const extractPlaylistId = (url: string): string | null => {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter((part) => part.length > 0);
    const playlistIndex = pathParts.indexOf('playlist');
    if (playlistIndex !== -1 && playlistIndex + 1 < pathParts.length) {
      const playlistId = pathParts[playlistIndex + 1];
      // Проверяем, что ID не пустой и содержит только допустимые символы
      if (playlistId && /^[a-zA-Z0-9]+$/.test(playlistId)) {
        return playlistId;
      }
    }
  } catch (error) {
    console.error('Error extracting playlist ID:', error);
  }
  return null;
};

// Функция для получения всех треков плейлиста с пагинацией
const getAllPlaylistTracks = async (playlistId: string): Promise<any[]> => {
  const allTracks: any[] = [];
  let offset = 0;
  const limit = 50; // Максимальное количество треков за запрос согласно Spotify API

  while (true) {
    const response = await spotifyApi.getPlaylistTracks(playlistId, offset, limit);

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

function UniversalExportDialog({ playlist, children }: UniversalExportDialogProps) {
  const { authStatus } = useSpotifyStore();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<ExportStep>('select');
  const [selectedTarget, setSelectedTarget] = useState<ExportTarget | null>(null);
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

      // Проверяем структуру данных
      if (!playlistData) {
        throw new Error('Не удалось получить данные плейлиста');
      }

      if (!playlistData.owner) {
        throw new Error('Не удалось получить информацию о владельце плейлиста');
      }

      // Проверяем, что плейлист принадлежит авторизованному пользователю
      if (playlistData.owner.id !== authStatus.user?.id) {
        throw new Error('Этот плейлист не принадлежит вашему аккаунту');
      }

      // Получаем все треки плейлиста с пагинацией
      const allTracks = await getAllPlaylistTracks(playlistId);

      // Проверяем, что получили треки
      if (!allTracks || allTracks.length === 0) {
        throw new Error('Плейлист не содержит треков');
      }

      const tracks = allTracks
        .filter((item: any) => item && item.track) // Фильтруем пустые элементы
        .map((item: any) => ({
          id: item.track.id,
          name: item.track.name,
          artist: item.track.artists?.[0]?.name || 'Unknown Artist',
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
      if (playlist) {
        setSpotifyPlaylist(playlist);
      } else {
        setError('Не удалось загрузить плейлист');
      }
    } catch (error: any) {
      console.error('Error fetching playlist:', error);
      setError(error.message || 'Произошла ошибка при загрузке плейлиста');
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

  const createNewSpotifyPlaylist = async (): Promise<string> => {
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

  const updateExistingSpotifyPlaylist = async (): Promise<void> => {
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

  const exportToM3UFile = () => {
    const tracksWithM3UData = playlist.tracks.filter((track) => track.m3uData);

    if (tracksWithM3UData.length === 0) {
      throw new Error('Нет треков с данными файлов для экспорта');
    }

    // Создаем содержимое M3U файла
    const m3uContent = [
      '#EXTM3U',
      ...tracksWithM3UData.map((track) => {
        const m3uData = track.m3uData!;
        const duration = Math.floor(m3uData.duration);
        return `#EXTINF:${duration},${m3uData.artist} - ${m3uData.title}\n${m3uData.url}`;
      }),
    ].join('\n');

    // Создаем Blob и скачиваем файл
    const blob = new Blob([m3uContent], { type: 'application/x-mpegurl' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${playlist.name}.m3u8`;
    document.body.append(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const resetDialogState = () => {
    setCurrentStep('select');
    setSelectedTarget(null);
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
      // При открытии диалога полностью сбрасываем состояние
      resetDialogState();
    }
  };

  const handleTargetSelect = (target: ExportTarget) => {
    setSelectedTarget(target);
    setCurrentStep('configure');
  };

  const handleExport = async () => {
    if (selectedTarget === 'spotify' && !authStatus.isAuthenticated) {
      setError('Необходимо авторизоваться в Spotify');
      return;
    }

    setIsLoading(true);
    setError(null);
    setCurrentStep('export');

    try {
      if (selectedTarget === 'spotify') {
        if (exportMode === 'new') {
          const playlistId = await createNewSpotifyPlaylist();
          setCreatedPlaylistId(playlistId);
          setSuccessMessage('Плейлист успешно создан!');
        } else {
          await updateExistingSpotifyPlaylist();
          setSuccessMessage('Плейлист успешно обновлен!');
        }
      } else if (selectedTarget === 'file') {
        // Для файлов сразу выполняем экспорт при переходе на этап
        exportToM3UFile();
        setSuccessMessage('Файл успешно экспортирован!');
      }

      setCurrentStep('result');
    } catch (error: any) {
      setError(error.message);
      setCurrentStep('configure');
    } finally {
      setIsLoading(false);
    }
  };

  const renderSelectStep = () => (
    <div className='space-y-4'>
      <div className='text-center'>
        <h3 className='text-lg font-semibold mb-2'>Выберите формат экспорта</h3>
        <p className='text-muted-foreground mb-6'>
          Куда хотите экспортировать плейлист?
        </p>
      </div>

      <div className='grid gap-4'>
        <button
          type='button'
          onClick={() => handleTargetSelect('spotify')}
          className='flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors'
        >
          <div className='w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center'>
            <Music className='h-6 w-6 text-green-600' />
          </div>
          <div className='flex-1 text-left'>
            <h4 className='font-medium'>Spotify</h4>
            <p className='text-sm text-muted-foreground'>
              Создать новый плейлист или обновить существующий в Spotify
            </p>
          </div>
        </button>

        <button
          type='button'
          onClick={() => handleTargetSelect('file')}
          className='flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors'
        >
          <div className='w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center'>
            <FileText className='h-6 w-6 text-blue-600' />
          </div>
          <div className='flex-1 text-left'>
            <h4 className='font-medium'>M3U файл</h4>
            <p className='text-sm text-muted-foreground'>
              Скачать плейлист как M3U файл с треками, имеющими данные файлов
            </p>
          </div>
        </button>
      </div>
    </div>
  );

  const renderConfigureStep = () => {
    if (selectedTarget === 'spotify') {
      const comparison = getTrackComparison();

      return (
        <div className='space-y-4'>
          <div className='text-center'>
            <h3 className='text-lg font-semibold mb-2'>Настройка экспорта в Spotify</h3>
            <p className='text-muted-foreground mb-6'>
              Выберите режим экспорта и настройте параметры
            </p>
          </div>

          {error && (
            <div className='text-sm text-red-600 bg-red-50 p-3 rounded'>
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
        </div>
      );
    }

    if (selectedTarget === 'file') {
      const tracksWithM3UData = playlist.tracks.filter((track) => track.m3uData);
      const totalTracks = playlist.tracks.length;

      return (
        <div className='space-y-4'>
          <div className='text-center'>
            <h3 className='text-lg font-semibold mb-2'>Экспорт в M3U файл</h3>
            <p className='text-muted-foreground mb-6'>
              Создастся файл с треками, имеющими данные файлов
            </p>
          </div>

          <div className='p-4 border rounded-lg bg-muted/20'>
            <h4 className='font-medium mb-2'>Информация о плейлисте</h4>
            <div className='space-y-1 text-sm'>
              <div className='flex justify-between'>
                <span>Всего треков:</span>
                <span className='font-medium'>{totalTracks}</span>
              </div>
              <div className='flex justify-between'>
                <span>Треков с данными файлов:</span>
                <span className='font-medium text-green-600'>{tracksWithM3UData.length}</span>
              </div>
              <div className='flex justify-between'>
                <span>Треков без данных файлов:</span>
                <span className='font-medium text-orange-600'>{totalTracks - tracksWithM3UData.length}</span>
              </div>
            </div>
          </div>

          {tracksWithM3UData.length === 0 && (
            <div className='text-sm text-red-600 bg-red-50 p-3 rounded'>
              В плейлисте нет треков с данными файлов для экспорта
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  const renderExportStep = () => (
    <div className='text-center space-y-4'>
      <Loader2 className='h-12 w-12 animate-spin mx-auto text-blue-600' />
      <h3 className='text-lg font-semibold'>
        {selectedTarget === 'spotify' ? 'Экспорт в Spotify...' : 'Создание файла...'}
      </h3>
      <p className='text-muted-foreground'>
        Пожалуйста, подождите
      </p>
    </div>
  );

  const renderResultStep = () => (
    <div className='space-y-4'>
      {error && (
        <div className='text-sm text-red-600 bg-red-50 p-3 rounded'>
          {error}
        </div>
      )}

      {successMessage && (
        <div className='text-center space-y-4'>
          <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto'>
            <Download className='h-8 w-8 text-green-600' />
          </div>
          <h3 className='text-lg font-semibold text-green-600'>Экспорт завершен!</h3>
          <p className='text-muted-foreground'>
            {successMessage}
          </p>
          {createdPlaylistId && (
            <div className='pt-2'>
              <a
                href={`https://open.spotify.com/playlist/${createdPlaylistId}`}
                target='_blank'
                rel='noopener noreferrer'
                className='text-blue-600 hover:underline flex items-center gap-1 justify-center'
              >
                <ExternalLink className='h-4 w-4' />
                Открыть в Spotify
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'select': {
        return renderSelectStep();
      }
      case 'configure': {
        return renderConfigureStep();
      }
      case 'export': {
        return renderExportStep();
      }
      case 'result': {
        return renderResultStep();
      }
      default: {
        return renderSelectStep();
      }
    }
  };

  const canProceedToExport = () => {
    if (selectedTarget === 'spotify') {
      if (exportMode === 'new') {
        return true;
      }
      return spotifyPlaylist !== null;
    }
    if (selectedTarget === 'file') {
      const tracksWithM3UData = playlist.tracks.filter((track) => track.m3uData);
      return tracksWithM3UData.length > 0;
    }
    return false;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className='max-w-2xl max-h-[80vh] overflow-hidden'>
        <DialogHeader>
          <DialogTitle>Экспорт плейлиста</DialogTitle>
          <DialogDescription>
            Выберите формат и настройте параметры экспорта
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4 overflow-y-auto max-h-[calc(80vh-200px)]'>
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
              ['configure', 'export'].includes(currentStep) ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
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
              onClick={() => {
                if (currentStep === 'configure') {
                  setCurrentStep('select');
                }
              }}
              disabled={isLoading}
            >
              Назад
            </Button>
          )}
          <div className='flex-1' />
          {currentStep === 'configure' && (
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
              {selectedTarget === 'spotify'
                ? (exportMode === 'new' ? 'Создать плейлист' : 'Обновить плейлист')
                : 'Скачать файл'}
            </Button>
          )}
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

export default UniversalExportDialog;
