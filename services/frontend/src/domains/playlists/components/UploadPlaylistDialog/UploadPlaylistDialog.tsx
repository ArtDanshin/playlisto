'use client';

import { useState, useRef } from 'react';
import { Upload, FileAudio } from 'lucide-react';

import type { ParsedPlaylist } from '@/shared/utils/m3u-parser';
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

interface UploadPlaylistDialogProps {
  onPlaylistUploaded: (playlist: ParsedPlaylist) => void;
  children: React.ReactNode;
}

function UploadPlaylistDialog({ onPlaylistUploaded, children }: UploadPlaylistDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

      onPlaylistUploaded(playlist);
      setIsOpen(false);
    } catch (err) {
      setError('Ошибка при чтении файла. Пожалуйста, попробуйте еще раз.');
      console.error('Error parsing M3U file:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Загрузить плейлист</DialogTitle>
          <DialogDescription>
            Выберите файл формата M3U или M3U8 для загрузки плейлиста
          </DialogDescription>
        </DialogHeader>

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
          </div>
        </div>

        <input
          ref={fileInputRef}
          type='file'
          accept='.m3u,.m3u8'
          onChange={handleFileSelect}
          className='hidden'
        />
      </DialogContent>
    </Dialog>
  );
}

export default UploadPlaylistDialog;
