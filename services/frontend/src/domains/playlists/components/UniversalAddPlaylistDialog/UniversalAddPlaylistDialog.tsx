'use client';

import { useState, useRef } from 'react';
import { Upload, FileAudio, Music, ArrowLeft } from 'lucide-react';

import type { Playlist, Track } from '@/shared/types';
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
import { Input } from '@/shared/components/ui/Input';
import { Label } from '@/shared/components/ui/Label';
import { playlistDB } from '@/infrastructure/storage/indexed-db';
import { spotifyApi } from '@/infrastructure/api/spotify-api';
import { useSpotifyStore } from '@/domains/spotify/store/spotify-store';

interface UniversalAddPlaylistDialogProps {
  onPlaylistAdded: (playlist: Playlist) => void;
  children: React.ReactNode;
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

function UniversalAddPlaylistDialog({ onPlaylistAdded, children }: UniversalAddPlaylistDialogProps) {
  const { authStatus } = useSpotifyStore();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSource, setSelectedSource] = useState<SourceType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

      onPlaylistAdded(playlist);
      setIsOpen(false);
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

      // Конвертируем треки
      const tracks: Track[] = [];
      for (let i = 0; i < playlistData.tracks.items.length; i++) {
        const spotifyTrack = playlistData.tracks.items[i];
        if (spotifyTrack.track) {
          const track = await convertSpotifyTrackToTrack(spotifyTrack, i + 1);
          tracks.push(track);
        }
      }

      const playlist: Playlist = {
        name: playlistData.name,
        order: 0, // Будет установлен при добавлении
        tracks,
      };

      onPlaylistAdded(playlist);
      setIsOpen(false);
      setSpotifyUrl('');
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

  const resetDialogState = () => {
    setError(null);
    setIsLoading(false);
    setSelectedSource(null);
    setSpotifyUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleBackToSourceSelection = () => {
    setSelectedSource(null);
    setError(null);
    setSpotifyUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getCurrentStep = () => {
    if (!selectedSource) return 1;
    return 2;
  };

  const getStepDescription = () => {
    const step = getCurrentStep();
    switch (step) {
      case 1: {
        return 'Выберите источник для добавления нового плейлиста';
      }
      case 2: {
        return selectedSource === 'file'
          ? 'Загрузите файл M3U для создания плейлиста'
          : 'Введите ссылку на плейлист Spotify';
      }
      default: {
        return '';
      }
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      resetDialogState();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Добавить плейлист</DialogTitle>
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
          </div>
          <span className='text-sm text-muted-foreground'>
            Шаг {getCurrentStep()} из 2
          </span>
        </div>

        <div className='space-y-4'>
          {error && (
            <div className='p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md'>
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

              <div className='text-xs text-muted-foreground'>
                Поддерживаемые форматы:
                <br />
                • https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M
                <br />
                • https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M?si=...
              </div>
            </div>
          )}

        </div>
      </DialogContent>
    </Dialog>
  );
}

export default UniversalAddPlaylistDialog;
