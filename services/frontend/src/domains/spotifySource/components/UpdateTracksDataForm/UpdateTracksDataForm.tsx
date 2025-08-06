'use client';

import { useState } from 'react';
import { AlertCircle, Loader2, Music } from 'lucide-react';

import type { MatchForm } from '@/shared/types/source';
import { Button } from '@/shared/components/ui/Button';
import { spotifyService } from '@/infrastructure/services/spotify';

import { useSpotifyStore } from '../../store';

const UpdateTracksDataForm: MatchForm = function ({ tracks, updateTracks }) {
  const { authStatus } = useSpotifyStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);

  const handleSpotifyUpdate = async () => {
    if (!authStatus.isAuthenticated) {
      setError('Необходимо авторизоваться в Spotify');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const { allTracks, onlyUpdatedTracks, notUpdatedTracks } = await spotifyService.searhAndMatchTracks(tracks, (current, total) => {
        setProgress({ current, total });
      });

      updateTracks(allTracks, onlyUpdatedTracks, notUpdatedTracks);
    } catch (error: any) {
      setError(error.message || 'Ошибка при импорте плейлиста');
      console.error('Spotify playlist import error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className='space-y-4'>
      {error && (
        <div className='p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md'>
          {error}
        </div>
      )}

      <div className='text-center'>
        <Music className='h-12 w-12 text-green-500 mx-auto mb-4' />
        <h3 className='text-lg font-semibold mb-2'>Распознавание в Spotify</h3>
        <p className='text-muted-foreground'>
          Поиск точных совпадений треков в Spotify API
        </p>
      </div>

      {authStatus.isAuthenticated
        ? isProcessing
          ? (
              <div className='text-center py-8'>
                <Loader2 className='h-12 w-12 animate-spin text-blue-500 mx-auto mb-4' />
                <h3 className='text-lg font-semibold mb-2'>Распознаем треки...</h3>
                <p className='text-muted-foreground'>
                  Прогресс: {progress.current} из {progress.total}
                </p>
                <div className='w-full bg-gray-200 rounded-full h-2 mt-4'>
                  <div
                    className='bg-blue-500 h-2 rounded-full transition-all duration-300'
                    style={{ width: `${(progress.current / progress.total) * 100}%` }}
                  />
                </div>
              </div>
            )
          : (
              <div className='space-y-4'>
                <div className='text-center'>
                  <Music className='h-12 w-12 text-green-500 mx-auto mb-4' />
                  <h3 className='text-lg font-semibold mb-2'>Готов к распознаванию</h3>
                  <p className='text-muted-foreground'>
                    Найдено {tracks.filter((t) => !t.spotifyData).length} треков для распознавания
                  </p>
                </div>

                <Button
                  onClick={handleSpotifyUpdate}
                  className='w-full'
                  size='lg'
                >
                  <Music className='mr-2 h-4 w-4' />
                  Начать распознавание
                </Button>
              </div>
            )
        : (
            <div className='text-center py-8'>
              <AlertCircle className='h-12 w-12 text-orange-500 mx-auto mb-4' />
              <h3 className='text-lg font-semibold mb-2'>Требуется авторизация</h3>
              <p className='text-muted-foreground'>
                Для распознавания треков необходимо авторизоваться в Spotify
              </p>
            </div>
          )}
    </div>
  );
};

export default UpdateTracksDataForm;
