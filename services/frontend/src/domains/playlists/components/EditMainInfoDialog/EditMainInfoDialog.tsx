'use client';

import { useState, useRef } from 'react';
import type { ChangeEvent, ReactNode } from 'react';
import { Upload, X } from 'lucide-react';

import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/shared/components/ui/Dialog';
import { ImageCover } from '@/shared/components/ImageCover';
import type { Playlist } from '@/shared/types/playlist';
import { playlistoDBService } from '@/infrastructure/services/playlisto-db';
import { imageUploader } from '@/shared/utils/image';

import { CoverWithLoad } from '../CoverWithLoad';
import { usePlaylistStore } from '../../store';

interface EditMainInfoDialogProps {
  playlist: Playlist;
  children: ReactNode;
}

function EditMainInfoDialog({ playlist, children }: EditMainInfoDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCover, setIsLoadingCover] = useState(false);
  const [name, setName] = useState(playlist.name);
  const [description, setDescription] = useState(playlist.description || '');
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { updatePlaylistInfo } = usePlaylistStore();

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Название плейлиста обязательно');
      return;
    }

    setIsLoading(true);

    try {
      const updates: Pick<Playlist, 'name' | 'description' | 'coverKey'> = {
        name: name.trim(),
        description: description.trim() || undefined,
      };

      // Если есть новая обложка, загружаем её
      if (coverPreview) {
        const coverKey = `playlist_${playlist.id}`;

        await playlistoDBService.addCoverByBase64(coverPreview, coverKey);
        updates.coverKey = coverKey;
      }

      // Обновляем информацию плейлиста
      await updatePlaylistInfo(playlist, updates);

      setIsOpen(false);
    } catch (error: any) {
      setError(error.message || 'Ошибка при сохранении');
    }

    setIsLoading(false);
  };

  const handleCoverChange = async (event: ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setIsLoadingCover(true);

    try {
      const imageBase64 = await imageUploader(event.target.files?.[0]);
      setCoverPreview(imageBase64);
    } catch (error_) {
      setError(error_ as string);
    } finally {
      setIsLoadingCover(false);
    }
  };

  const handleRemoveCover = () => {
    setCoverPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Сбрасываем состояние при закрытии
      setName(playlist.name);
      setDescription(playlist.description || '');
      setCoverPreview(null);
      setError(null);
      setIsLoading(false);
      setIsLoadingCover(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
    setIsOpen(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>Редактировать плейлист</DialogTitle>
        </DialogHeader>

        <div className='space-y-4'>
          {/* Обложка */}
          <div className='space-y-2'>
            <label className='text-sm font-medium'>Обложка</label>
            <div className='flex items-center gap-4'>
              <div className='relative'>
                {isLoadingCover || coverPreview
                  ? (
                      <div className='relative w-52 h-52 bg-gray-100 rounded-lg overflow-hidden'>
                        <ImageCover
                          imageBase64={coverPreview}
                          size='xl'
                          status={isLoadingCover ? 'loading' : 'default'}
                        />
                        <button
                          type='button'
                          onClick={handleRemoveCover}
                          className='absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600'
                        >
                          <X className='w-4 h-4' />
                        </button>
                      </div>
                    )
                  : (
                      <CoverWithLoad
                        coverKey={playlist.coverKey}
                        size='xl'
                      />
                    )}
              </div>
              <div className='flex-1'>
                <input
                  ref={fileInputRef}
                  type='file'
                  accept='image/*'
                  onChange={handleCoverChange}
                  className='hidden'
                />
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className='w-4 h-4 mr-2' />
                  Загрузить обложку
                </Button>
                <p className='text-xs text-gray-500 mt-1'>
                  Максимальный размер файла: 10MB. Изображение будет автоматически уменьшено до 1000x1000px
                </p>
              </div>
            </div>
          </div>

          {/* Название */}
          <div className='space-y-2'>
            <label htmlFor='name' className='text-sm font-medium'>
              Название *
            </label>
            <Input
              id='name'
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='Введите название плейлиста'
            />
          </div>

          {/* Описание */}
          <div className='space-y-2'>
            <label htmlFor='description' className='text-sm font-medium'>
              Описание
            </label>
            <textarea
              id='description'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder='Введите описание плейлиста'
              rows={3}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            />
          </div>

          {/* Ошибка */}
          {error && (
            <div className='text-red-500 text-sm'>
              {error}
            </div>
          )}

          {/* Кнопки */}
          <div className='flex justify-end gap-2'>
            <Button
              variant='outline'
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Отмена
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading}
            >
              {isLoading ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default EditMainInfoDialog;
