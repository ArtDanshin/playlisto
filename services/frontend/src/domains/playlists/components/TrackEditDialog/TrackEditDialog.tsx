'use client';

import { useState, useEffect } from 'react';
import {
  Search, Music, Loader2, ExternalLink, Link,
} from 'lucide-react';

import type { Track, SpotifyTrackData } from '@/shared/types';
import { spotifyApi } from '@/infrastructure/api/spotify-api';
import { useSpotifyStore } from '@/domains/spotify/store/spotify-store';
import { updateTrackWithSpotify } from '@/shared/utils/playlist-utils';
import { extractTrackIdFromUrl, isValidSpotifyTrackUrl } from '@/shared/utils/spotify-url-utils';
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

  // Обновляем форму при изменении трека
  useEffect(() => {
    setFormData({
      title: track.title,
      artist: track.artist,
      album: track.album,
    });
    // Сбрасываем состояние поиска при смене трека
    setSearchResults([]);
    setShowSearchResults(false);
    setError(null);
    setSpotifyUrl('');
  }, [track.title, track.artist, track.album, track.spotifyData?.id]);

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

  const handleSave = () => {
    const updatedTrack: Track = {
      ...track,
      title: formData.title,
      artist: formData.artist,
      album: formData.album,
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
      const updatedTrack = await updateTrackWithSpotify(track, spotifyTrack);

      // Обновляем форму с данными из Spotify
      setFormData({
        title: track.title, // Сохраняем оригинальное название
        artist: track.artist, // Сохраняем оригинального исполнителя
        album: spotifyTrack.album.name, // Обновляем альбом из Spotify
      });

      onTrackUpdate(updatedTrack);
      setShowSearchResults(false);
      setSearchResults([]);
      setSpotifyUrl('');
    } catch {
      setError('Ошибка при связывании трека со Spotify');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className='max-w-2xl max-h-[80vh] overflow-hidden'>
        <DialogHeader>
          <DialogTitle>Редактировать трек</DialogTitle>
          <DialogDescription>
            Измените информацию о треке и свяжите его со Spotify
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          {/* Form Fields */}
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

          {/* Spotify Integration */}
          <div className='space-y-3'>
            <div className='flex items-center gap-2'>
              <Music className='h-4 w-4' />
              <span className='font-medium'>Spotify</span>
              {track.spotifyData && (
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
            {track.spotifyData && (
              <div className='space-y-2'>
                <h4 className='text-sm font-medium'>Связанный трек в Spotify:</h4>
                <div className='flex items-center gap-3 p-3 border rounded-lg bg-muted/20'>
                  {track.spotifyData.coverUrl && (
                    <img
                      src={track.spotifyData.coverUrl}
                      alt={track.spotifyData.album}
                      className='w-12 h-12 rounded'
                    />
                  )}
                  <div className='flex-1'>
                    <p className='font-medium'>{track.spotifyData.title}</p>
                    <p className='text-sm text-muted-foreground'>
                      {track.spotifyData.artist}
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      {track.spotifyData.album}
                    </p>
                  </div>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => window.open(`https://open.spotify.com/track/${track.spotifyData!.id}`, '_blank')}
                  >
                    <ExternalLink className='h-4 w-4' />
                  </Button>
                </div>
              </div>
            )}
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
