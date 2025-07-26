'use client';

import { useState, useEffect } from 'react';
import {
  Search, Music, Loader2, ExternalLink, Link, FileText, Info,
} from 'lucide-react';

import type { Track } from '@/shared/types';
import { spotifyApi, type SpotifyTrackData } from '@/infrastructure/api/spotify';
import { useSpotifyStore } from '@/domains/spotifySource/store';
import { updateTrackWithSpotify } from '@/shared/utils/playlist';
import { extractTrackIdFromUrl, isValidSpotifyTrackUrl } from '@/shared/utils/spotify';
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
import { Separator } from '@/shared/components/ui/Separator';
import { ScrollArea } from '@/shared/components/ui/ScrollArea';

interface TrackEditDialogProps {
  track: Track;
  onTrackUpdate: (updatedTrack: Track) => void;
  children: React.ReactNode;
}

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/* eslint-disable react-hooks-extra/no-direct-set-state-in-use-effect */
/* TODO: Глянуть логику заполнения формы при изменении трека */
function TrackEditDialog({ track, onTrackUpdate, children }: TrackEditDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'spotify' | 'm3u'>('general');
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchingByUrl, setIsSearchingByUrl] = useState(false);
  const [searchResults, setSearchResults] = useState<SpotifyTrackData[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [spotifyUrl, setSpotifyUrl] = useState('');

  const { authStatus } = useSpotifyStore();

  // Form state
  const [formData, setFormData] = useState({
    title: track.title,
    artist: track.artist,
    album: track.album,
  });

  // M3U data form state
  const [m3uFormData, setM3uFormData] = useState({
    title: track.m3uData?.title || track.title || '',
    artist: track.m3uData?.artist || track.artist || '',
    url: track.m3uData?.url || '',
    duration: track.m3uData?.duration || 0,
  });

  // Local track state for display
  const [localTrack, setLocalTrack] = useState<Track>(track);

  // Обновляем форму при изменении трека
  useEffect(() => {
    setFormData({
      title: track.title,
      artist: track.artist,
      album: track.album,
    });
    setM3uFormData({
      title: track.m3uData?.title || track.title || '',
      artist: track.m3uData?.artist || track.artist || '',
      url: track.m3uData?.url || '',
      duration: track.m3uData?.duration || 0,
    });
    setLocalTrack(track);
    // Сбрасываем состояние поиска при смене трека
    setSearchResults([]);
    setShowSearchResults(false);
    setError(null);
    setSpotifyUrl('');
  }, [track]);

  // Сбрасываем состояние поиска при открытии/закрытии диалога
  useEffect(() => {
    if (!isOpen) {
      setSearchResults([]);
      setShowSearchResults(false);
      setError(null);
      setSpotifyUrl('');
    }
  }, [isOpen]);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleM3uInputChange = (field: keyof typeof m3uFormData, value: string | number) => {
    setM3uFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    const updatedTrack: Track = {
      ...localTrack,
      title: formData.title,
      artist: formData.artist,
      album: formData.album,
      m3uData: {
        title: m3uFormData.title,
        artist: m3uFormData.artist,
        url: m3uFormData.url,
        duration: m3uFormData.duration,
      },
      // Сохраняем Spotify данные из локального состояния
      spotifyData: localTrack.spotifyData,
      coverKey: localTrack.coverKey,
    };
    onTrackUpdate(updatedTrack);
    setIsOpen(false);
  };

  const handleSearch = async () => {
    if (!formData.title.trim() || !formData.artist.trim() || !authStatus.isAuthenticated) {
      setError('Введите название трека и исполнителя для поиска');
      return;
    }

    setIsSearching(true);
    setError(null);
    setSearchResults([]);
    setShowSearchResults(false);

    try {
      const query = `${formData.artist} ${formData.title}`.trim();
      const response = await spotifyApi.searchTracks(query);
      setSearchResults(response.tracks.items);
      setShowSearchResults(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Ошибка поиска в Spotify');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchByUrl = async () => {
    if (!spotifyUrl.trim() || !authStatus.isAuthenticated) {
      setError('Введите Spotify URL трека для поиска');
      return;
    }

    if (!isValidSpotifyTrackUrl(spotifyUrl)) {
      setError('Неверный формат Spotify URL. Поддерживаются ссылки вида: https://open.spotify.com/track/ID');
      return;
    }

    setIsSearchingByUrl(true);
    setError(null);
    setSearchResults([]);
    setShowSearchResults(false);

    try {
      const trackId = extractTrackIdFromUrl(spotifyUrl);
      if (!trackId) {
        setError('Не удалось извлечь ID трека из URL');
        return;
      }

      const spotifyTrack = await spotifyApi.getTrack(trackId);
      setSearchResults([spotifyTrack]);
      setShowSearchResults(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Ошибка поиска трека по URL');
    } finally {
      setIsSearchingByUrl(false);
    }
  };

  const handleSelectSpotifyTrack = async (spotifyTrack: SpotifyTrackData) => {
    try {
      // Обновляем форму с данными из Spotify
      setFormData({
        title: track.title, // Сохраняем оригинальное название
        artist: track.artist, // Сохраняем оригинального исполнителя
        album: spotifyTrack.album.name, // Обновляем альбом из Spotify
      });

      // Создаем временный обновленный трек для отображения
      const tempUpdatedTrack = await updateTrackWithSpotify(track, spotifyTrack);

      // Обновляем локальное состояние трека для отображения
      setLocalTrack(tempUpdatedTrack);

      setShowSearchResults(false);
      setSearchResults([]);
      setSpotifyUrl('');

      // НЕ сохраняем в плейлист автоматически - пользователь должен нажать "Сохранить"
    } catch {
      setError('Ошибка при связывании трека со Spotify');
    }
  };

  const renderGeneralTab = () => (
    <div className='space-y-4'>
      <div className='grid gap-4'>
        <div className='grid gap-2'>
          <Label htmlFor='title'>Название</Label>
          <Input
            id='title'
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder='Название трека'
          />
        </div>

        <div className='grid gap-2'>
          <Label htmlFor='artist'>Исполнитель</Label>
          <Input
            id='artist'
            value={formData.artist}
            onChange={(e) => handleInputChange('artist', e.target.value)}
            placeholder='Исполнитель'
          />
        </div>

        <div className='grid gap-2'>
          <Label htmlFor='album'>Альбом</Label>
          <Input
            id='album'
            value={formData.album}
            onChange={(e) => handleInputChange('album', e.target.value)}
            placeholder='Альбом'
          />
        </div>
      </div>

      <Separator />

      <div className='space-y-2'>
        <h4 className='text-sm font-medium flex items-center gap-2'>
          <Info className='h-4 w-4' />
          Информация о треке
        </h4>
        <div className='text-sm text-muted-foreground space-y-1'>
          <p>Позиция в плейлисте: {localTrack.position}</p>
          {localTrack.spotifyData && (
            <p className='text-green-600'>✓ Связан со Spotify</p>
          )}
          {localTrack.m3uData && (
            <p className='text-blue-600'>✓ Имеет данные файла</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderSpotifyTab = () => (
    <div className='space-y-4'>
      <div className='flex items-center gap-2'>
        <Music className='h-4 w-4' />
        <span className='font-medium'>Spotify</span>
        {localTrack.spotifyData && (
          <span className='text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full'>
            Связан
          </span>
        )}
      </div>

      {error && (
        <div className='text-sm text-red-600 bg-red-50 p-2 rounded'>
          {error}
        </div>
      )}

      {/* Search by URL */}
      <div className='space-y-2'>
        <Label htmlFor='spotify-url'>Spotify URL трека</Label>
        <div className='flex gap-2'>
          <Input
            id='spotify-url'
            value={spotifyUrl}
            onChange={(e) => setSpotifyUrl(e.target.value)}
            placeholder='https://open.spotify.com/track/...'
            className='flex-1'
          />
          <Button
            onClick={handleSearchByUrl}
            disabled={isSearchingByUrl || !authStatus.isAuthenticated || !spotifyUrl.trim()}
            variant='outline'
            size='sm'
          >
            {isSearchingByUrl
              ? (
                  <Loader2 className='h-4 w-4 animate-spin' />
                )
              : (
                  <Link className='h-4 w-4' />
                )}
          </Button>
        </div>
        <p className='text-xs text-muted-foreground'>
          Вставьте ссылку на трек из Spotify для точного поиска
        </p>
      </div>

      <div className='flex items-center gap-2'>
        <div className='flex-1 h-px bg-border' />
        <span className='text-xs text-muted-foreground px-2'>или</span>
        <div className='flex-1 h-px bg-border' />
      </div>

      <Button
        onClick={handleSearch}
        disabled={isSearching || !authStatus.isAuthenticated}
        variant='outline'
        className='w-full'
      >
        {isSearching
          ? (
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            )
          : (
              <Search className='mr-2 h-4 w-4' />
            )}
        Найти в Spotify по названию
      </Button>

      {!authStatus.isAuthenticated && (
        <p className='text-xs text-muted-foreground'>
          Для поиска в Spotify необходимо авторизоваться
        </p>
      )}

      {/* Search Results */}
      {showSearchResults && (
        <div className='space-y-2'>
          <h4 className='text-sm font-medium'>Результаты поиска:</h4>
          <ScrollArea className='h-48'>
            <div className='space-y-2'>
              {searchResults.length === 0
                ? (
                    <p className='text-sm text-muted-foreground'>Ничего не найдено</p>
                  )
                : (
                    searchResults.map((spotifyTrack) => (
                      <div
                        key={spotifyTrack.id}
                        className='flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer'
                        onClick={() => handleSelectSpotifyTrack(spotifyTrack)}
                      >
                        {/* Album Cover */}
                        <div className='flex-shrink-0'>
                          {spotifyTrack.album.images.length > 0
                            ? (
                                <img
                                  src={spotifyTrack.album.images[0].url}
                                  alt={spotifyTrack.album.name}
                                  className='w-12 h-12 rounded'
                                />
                              )
                            : (
                                <div className='w-12 h-12 bg-muted rounded flex items-center justify-center'>
                                  <Music className='h-6 w-6 text-muted-foreground' />
                                </div>
                              )}
                        </div>

                        {/* Track Info */}
                        <div className='flex-1 min-w-0'>
                          <p className='font-medium break-words whitespace-normal'>{spotifyTrack.name}</p>
                          <p className='text-sm text-muted-foreground break-words whitespace-normal'>{spotifyTrack.artists.map((a) => a.name).join(', ')}</p>
                          <p className='text-xs text-muted-foreground break-words whitespace-normal'>
                            {spotifyTrack.album.name}
                            {' '}
                            •
                            {formatDuration(Math.round(spotifyTrack.duration_ms / 1000))}
                          </p>
                        </div>

                        {/* External Link */}
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(spotifyTrack.external_urls.spotify, '_blank');
                          }}
                        >
                          <ExternalLink className='h-4 w-4' />
                        </Button>
                      </div>
                    ))
                  )}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Current Spotify Data */}
      {localTrack.spotifyData && (
        <div className='space-y-2'>
          <h4 className='text-sm font-medium'>Связанный трек в Spotify:</h4>
          <div className='flex items-center gap-3 p-3 border rounded-lg bg-muted/20'>
            {localTrack.spotifyData.coverUrl && (
              <img
                src={localTrack.spotifyData.coverUrl}
                alt={localTrack.spotifyData.album}
                className='w-12 h-12 rounded'
              />
            )}
            <div className='flex-1'>
              <p className='font-medium'>{localTrack.spotifyData.title}</p>
              <p className='text-sm text-muted-foreground'>
                {localTrack.spotifyData.artist}
              </p>
              <p className='text-xs text-muted-foreground'>
                {localTrack.spotifyData.album}
              </p>
            </div>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => window.open(`https://open.spotify.com/track/${localTrack.spotifyData!.id}`, '_blank')}
            >
              <ExternalLink className='h-4 w-4' />
            </Button>
          </div>
          <p className='text-xs text-blue-600 bg-blue-50 p-2 rounded'>
            {/* eslint-disable-next-line react-classic/no-unescaped-entities */}
            💡 Изменения будут сохранены при нажатии кнопки "Сохранить"
          </p>
        </div>
      )}
    </div>
  );

  const renderM3UTab = () => (
    <div className='space-y-4'>
      <div className='flex items-center gap-2'>
        <FileText className='h-4 w-4' />
        <span className='font-medium'>Данные файла</span>
        {localTrack.m3uData && (
          <span className='text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full'>
            Настроено
          </span>
        )}
      </div>

      <div className='space-y-4'>
        <div className='grid gap-2'>
          <Label htmlFor='m3u-title'>Название трека</Label>
          <Input
            id='m3u-title'
            value={m3uFormData.title}
            onChange={(e) => handleM3uInputChange('title', e.target.value)}
            placeholder='Название трека'
          />
        </div>

        <div className='grid gap-2'>
          <Label htmlFor='m3u-artist'>Исполнитель</Label>
          <Input
            id='m3u-artist'
            value={m3uFormData.artist}
            onChange={(e) => handleM3uInputChange('artist', e.target.value)}
            placeholder='Исполнитель'
          />
        </div>

        <div className='grid gap-2'>
          <Label htmlFor='m3u-url'>Путь к файлу</Label>
          <Input
            id='m3u-url'
            value={m3uFormData.url}
            onChange={(e) => handleM3uInputChange('url', e.target.value)}
            placeholder='file:///path/to/track.mp3'
          />
        </div>

        <div className='grid gap-2'>
          <Label htmlFor='m3u-duration'>Длительность (секунды)</Label>
          <Input
            id='m3u-duration'
            type='number'
            value={m3uFormData.duration}
            onChange={(e) => handleM3uInputChange('duration', Number.parseInt(e.target.value, 10) || 0)}
            placeholder='180'
          />
        </div>
      </div>

      {localTrack.m3uData && (
        <div className='space-y-2'>
          <h4 className='text-sm font-medium'>Текущие данные файла:</h4>
          <div className='p-3 border rounded-lg bg-muted/20'>
            <p className='text-sm'>
              <span className='font-medium'>Название:</span> {localTrack.m3uData.title}
            </p>
            <p className='text-sm'>
              <span className='font-medium'>Исполнитель:</span> {localTrack.m3uData.artist}
            </p>
            <p className='text-sm'>
              <span className='font-medium'>Путь:</span> {localTrack.m3uData.url}
            </p>
            <p className='text-sm'>
              <span className='font-medium'>Длительность:</span> {formatDuration(localTrack.m3uData.duration)}
            </p>
          </div>
          <p className='text-xs text-blue-600 bg-blue-50 p-2 rounded'>
            {/* eslint-disable-next-line react-classic/no-unescaped-entities */}
            💡 Изменения будут сохранены при нажатии кнопки "Сохранить"
          </p>
        </div>
      )}
    </div>
  );

  const renderCurrentTab = () => {
    switch (activeTab) {
      case 'general': {
        return renderGeneralTab();
      }
      case 'spotify': {
        return renderSpotifyTab();
      }
      case 'm3u': {
        return renderM3UTab();
      }
      default: {
        return renderGeneralTab();
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className='max-w-4xl w-[90vw] max-h-[90vh] overflow-hidden'>
        <DialogHeader>
          <DialogTitle>Редактировать трек</DialogTitle>
          <DialogDescription>
            Измените информацию о треке и свяжите его с внешними источниками
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4 overflow-y-auto max-h-[calc(90vh-200px)]'>
          {/* Tab Navigation */}
          <div className='flex border-b sticky top-0 bg-background z-10'>
            <button
              type='button'
              onClick={() => setActiveTab('general')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'general'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Info className='h-4 w-4 inline mr-2' />
              Общая информация
            </button>
            <button
              type='button'
              onClick={() => setActiveTab('spotify')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'spotify'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Music className='h-4 w-4 inline mr-2' />
              Spotify
            </button>
            <button
              type='button'
              onClick={() => setActiveTab('m3u')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'm3u'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <FileText className='h-4 w-4 inline mr-2' />
              Данные файла
            </button>
          </div>

          {/* Tab Content */}
          <div className='min-h-[400px]'>
            {renderCurrentTab()}
          </div>
        </div>

        <div className='flex justify-end gap-2 pt-4'>
          <Button variant='outline' onClick={() => setIsOpen(false)}>
            Отмена
          </Button>
          <Button onClick={handleSave}>
            Сохранить
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default TrackEditDialog;
