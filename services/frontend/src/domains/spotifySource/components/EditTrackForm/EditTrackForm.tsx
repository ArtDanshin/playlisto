'use client';

import { useState } from 'react';
import { ExternalLink, Link, Loader2, Music, Search } from 'lucide-react';

import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Label } from '@/shared/components/ui/Label';
import { ScrollArea } from '@/shared/components/ui/ScrollArea';
import { spotifyService, type SpotifyTrackDataResponse } from '@/infrastructure/services/spotify';
import type { Track, SpotifyTrackData } from '@/shared/types/playlist';
import { formatDuration } from '@/shared/utils/common'; 
import { createTrackDataFromSpotify } from '@/shared/utils/spotify'; 

import { useSpotifyStore } from '../../store';
 
interface EditTrackFormProps {
  track: Track;
  onDataChange: (data: SpotifyTrackData) => void; 
}

function EditTrackForm({ track, onDataChange }: EditTrackFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchingByUrl, setIsSearchingByUrl] = useState(false);
  const [searchResults, setSearchResults] = useState<SpotifyTrackDataResponse[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [previewSpotifyTrack, setPreviewSpotifyTrack] = useState<Track>(track);
  
  const { authStatus } = useSpotifyStore();

  const handleSearch = async () => {
    if (!authStatus.isAuthenticated) {
      setError('Необходимо авторизоваться в Spotify');
      return;
    }
    
    if (!track?.title.trim() || !track?.artist.trim() || !authStatus.isAuthenticated) {
      setError('Введите название трека и исполнителя для поиска');
      return;
    }

    setIsSearching(true);
    setError(null);
    setSearchResults([]);
    setShowSearchResults(false);

    try {
      const spotifyTracks = await spotifyService.searchTracks(track.artist, track.title);
      setSearchResults(spotifyTracks);
      setShowSearchResults(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Ошибка поиска в Spotify');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchByUrl = async () => {
    if (!authStatus.isAuthenticated) {
      setError('Необходимо авторизоваться в Spotify');
      return;
    }

    if (!spotifyUrl.trim()) {
      setError('Введите Spotify URL трека для поиска');
      return;
    }

    setIsSearchingByUrl(true);
    setError(null);
    setSearchResults([]);
    setShowSearchResults(false);

    try {
      const spotifyTrack = await spotifyService.getTrackByURL(spotifyUrl);

      setSearchResults([spotifyTrack]);
      setShowSearchResults(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Ошибка поиска трека по URL');
    } finally {
      setIsSearchingByUrl(false);
    }
  };

  const handleSelectSpotifyTrack = async (spotifyTrack: SpotifyTrackDataResponse) => {
    try {
      const newTrackFromSpotify = createTrackDataFromSpotify(spotifyTrack);

      onDataChange(newTrackFromSpotify.spotifyData!);

      // Обновляем локальное состояние трека для отображения
      setPreviewSpotifyTrack(newTrackFromSpotify);

      setShowSearchResults(false);
      setSearchResults([]);
      setSpotifyUrl('');
    } catch {
      setError('Ошибка при связывании трека со Spotify');
    }
  };

  return (
    <div className='space-y-4'>
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
      {previewSpotifyTrack.spotifyData && (
        <div className='space-y-2'>
          <h4 className='text-sm font-medium'>Связанный трек в Spotify:</h4>
          <div className='flex items-center gap-3 p-3 border rounded-lg bg-muted/20'>
            {previewSpotifyTrack.spotifyData.coverUrl && (
              <img
                src={previewSpotifyTrack.spotifyData.coverUrl}
                alt={previewSpotifyTrack.spotifyData.album}
                className='w-12 h-12 rounded'
              />
            )}
            <div className='flex-1'>
              <p className='font-medium'>{previewSpotifyTrack.spotifyData.title}</p>
              <p className='text-sm text-muted-foreground'>
                {previewSpotifyTrack.spotifyData.artist}
              </p>
              <p className='text-xs text-muted-foreground'>
                {previewSpotifyTrack.spotifyData.album}
              </p>
            </div>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => window.open(`https://open.spotify.com/track/${previewSpotifyTrack.spotifyData!.id}`, '_blank')}
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
}

export default EditTrackForm;
