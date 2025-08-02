'use client';

import { useState, useMemo } from 'react';

import { Button } from '@/shared/components/ui/Button';
import type { ExportForm } from '@/shared/types/source';
import { exportToM3UFile } from '@/shared/utils/file';

const ExportPlaylistForm: ExportForm = ({ playlist, onSuccessExport, onCancel }) => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const tracksWithM3UData = playlist.tracks.filter((track) => track.m3uData);
  const totalTracks = playlist.tracks.length;

  const handleExport = async () => {
    setIsLoading(true);
    setError(null);

    try {
      exportToM3UFile(playlist.name, playlist.tracks);
      onSuccessExport('Файл успешно экспортирован!');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const canProceedToExport = useMemo(() => {
    const tracksWithM3UData = playlist.tracks.filter((track) => track.m3uData);
    return tracksWithM3UData.length > 0;
  }, [playlist]);

  return (
    <>
      <div className='space-y-4'>
        <div className='text-center'>
          <h3 className='text-lg font-semibold mb-2'>Экспорт в M3U файл</h3>
          <p className='text-muted-foreground mb-6'>
            Создастся файл с треками, имеющими данные файлов
          </p>
        </div>

        {error && (
          <div className='p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md'>
            {error}
          </div>
        )}

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
          disabled={isLoading || !canProceedToExport}
        >
          Скачать файл
        </Button>
      </div>
    </>
  );
}

export default ExportPlaylistForm;
