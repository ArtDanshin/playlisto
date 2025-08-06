'use client';

import { useRef, useState, type ChangeEvent } from 'react';
import { FileAudio, Upload } from 'lucide-react';

import type { SetPlaylistForm as SetPlaylistFormImp } from '@/shared/types/source';
import { Button } from '@/shared/components/ui/Button';
import { fileService } from '@/infrastructure/services/file';

import { createPlaylistFromFile } from '../../utils';

const NewPlaylistLoadForm: SetPlaylistFormImp = function ({ setPlaylist }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: ChangeEvent<HTMLInputElement>) => {
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
      const tracks = await fileService.getTracksFromM3UFile(file);
      const playlistName = file.name.replace(/\.[^/.]+$/, '');

      setPlaylist(createPlaylistFromFile(playlistName, tracks));
    } catch (error_) {
      setError('Ошибка при чтении файла. Пожалуйста, попробуйте еще раз.');

      console.error('Error parsing M3U file:', error_);
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
  );
};

export default NewPlaylistLoadForm;
