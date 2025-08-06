'use client';

import { useState } from 'react';
import { Music } from 'lucide-react';

import type { SetPlaylistForm as SetPlaylistFormImp } from '@/shared/types/source';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Label } from '@/shared/components/ui/Label';
import { spotifyService } from '@/infrastructure/services/spotify';
import { createPlaylistFromSpotify } from '@/shared/utils/spotify';

import { useSpotifyStore } from '../../store';

const SetPlaylistForm: SetPlaylistFormImp = function ({ setPlaylist }) {
  const { authStatus } = useSpotifyStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [spotifyUrl, setSpotifyUrl] = useState('');

  const handleSpotifyImport = async () => {
    if (!spotifyUrl.trim()) {
      setError('Пожалуйста, введите ссылку на плейлист Spotify');
      return;
    }

    if (!authStatus.isAuthenticated) {
      setError('Необходимо авторизоваться в Spotify');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const playlistInfo = await spotifyService.getPlaylistInfoByURL(spotifyUrl);
      const tracks = await spotifyService.getPlaylistTracksByURL(spotifyUrl);

      setPlaylist(createPlaylistFromSpotify(playlistInfo.name, tracks));
    } catch (error: any) {
      setError(error.message || 'Ошибка при импорте плейлиста');
      console.error('Spotify playlist import error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='space-y-4'>
      {error && (
        <div className='p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md'>
          {error}
        </div>
      )}

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

      <div className='text-xs text-muted-foreground'>
        Поддерживаемые форматы:
        <br />
        • https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M
        <br />
        • https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M?si=...
      </div>
    </div>
  );
};

export default SetPlaylistForm;
