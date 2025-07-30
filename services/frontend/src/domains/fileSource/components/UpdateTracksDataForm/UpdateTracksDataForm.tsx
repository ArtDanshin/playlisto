'use client';

import { useState, type ChangeEvent } from 'react';
import { FileText, Loader2, Upload } from 'lucide-react';

import type { MatchForm } from '@/shared/types/source';
import { Button } from '@/shared/components/ui/Button';
import { fileService } from '@/infrastructure/services/file';

const UpdateTracksDataForm: MatchForm = ({ tracks, updateTracks }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Обработка выбора файла
  const handleFileSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

// Функция обновления треков из M3U файла
  const handleM3UUpdate = async () => {
    if (!selectedFile) {
      setError('Ошибка при выборе файла');
      setSelectedFile(null);
      return;
    }

    setIsProcessing(true);
    try {
      const { allTracks, onlyUpdatedTracks, notUpdatedTracks } = await fileService.addDataToTracksFromM3UFile(selectedFile, tracks, (current, total) => {
        setProgress({ current, total });
      });

      updateTracks(allTracks, onlyUpdatedTracks, notUpdatedTracks);
    } catch (error: any) {
      setError(error.message || 'Ошибка при добавлении данных из файла');
      console.error('M3U data import error:', error);
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
        <FileText className='h-12 w-12 text-blue-500 mx-auto mb-4' />
        <h3 className='text-lg font-semibold mb-2'>Загрузка M3U файла</h3>
        <p className='text-muted-foreground'>
          Загрузите M3U файл для добавления информации о путях к файлам
        </p>
      </div>

      {selectedFile
        ? isProcessing
          ? (
              <div className='text-center py-8'>
                <Loader2 className='h-12 w-12 animate-spin text-blue-500 mx-auto mb-4' />
                <h3 className='text-lg font-semibold mb-2'>Обрабатываем файл...</h3>
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
                  <FileText className='h-12 w-12 text-green-500 mx-auto mb-4' />
                  <h3 className='text-lg font-semibold mb-2'>Файл загружен</h3>
                  <p className='text-muted-foreground'>
                    {selectedFile.name} - {Math.round(selectedFile.size / 1024)} KB
                  </p>
                </div>

                <Button
                  onClick={handleM3UUpdate}
                  className='w-full'
                  size='lg'
                >
                  <FileText className='mr-2 h-4 w-4' />
                  Обработать файл
                </Button>
              </div>
            )
        : (
            <div className='space-y-4'>
              <div className='border-2 border-dashed border-gray-300 rounded-lg p-8 text-center'>
                <Upload className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                <p className='text-lg font-medium mb-2'>Выберите M3U файл</p>
                <p className='text-muted-foreground mb-4'>
                  Поддерживаются файлы .m3u и .m3u8
                </p>
                <input
                  type='file'
                  accept='.m3u,.m3u8'
                  onChange={handleFileSelect}
                  className='hidden'
                  id='m3u-file-input'
                />
                <label htmlFor='m3u-file-input'>
                  <Button variant='outline' asChild>
                    <span>Выбрать файл</span>
                  </Button>
                </label>
              </div>
            </div>
          )}
    </div>
  )
}

export default UpdateTracksDataForm;
