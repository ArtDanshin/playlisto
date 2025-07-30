'use client';

import { useState } from 'react';
import { Download, Upload, Loader2, AlertCircle } from 'lucide-react';

import { Button } from '@/shared/components/ui/Button';
import { usePlaylistStore } from '@/domains/playlists/store';
import {
  exportDatabase,
  importDatabase,
  downloadDatabaseDump,
  readDatabaseDumpFromFile,
} from '@/infrastructure/storage/database-dump';

interface DatabaseBackupProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function DatabaseBackup({ onSuccess, onError }: DatabaseBackupProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const { loadPlaylists } = usePlaylistStore();

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const dump = await exportDatabase();
      downloadDatabaseDump(dump);
      onSuccess?.();
    } catch (error: any) {
      const errorMessage = error.message || 'Ошибка экспорта базы данных';
      onError?.(errorMessage);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const dump = await readDatabaseDumpFromFile(file);
      await importDatabase(dump);
      await loadPlaylists(); // Перезагружаем плейлисты
      onSuccess?.();
    } catch (error: any) {
      const errorMessage = error.message || 'Ошибка импорта базы данных';
      onError?.(errorMessage);
    } finally {
      setIsImporting(false);
      // Очищаем input для возможности повторного выбора того же файла
      event.target.value = '';
    }
  };

  return (
    <div className='space-y-3'>
      <div className='space-y-2'>
        <Button
          variant='outline'
          size='sm'
          onClick={handleExport}
          disabled={isExporting}
          className='w-full'
        >
          {isExporting
            ? (
                <Loader2 className='mr-2 h-3 w-3 animate-spin' />
              )
            : (
                <Download className='mr-2 h-3 w-3' />
              )}
          Экспорт данных
        </Button>

        <div className='relative'>
          <input
            type='file'
            accept='.json'
            onChange={handleImport}
            className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
            disabled={isImporting}
          />
          <Button
            variant='outline'
            size='sm'
            disabled={isImporting}
            className='w-full'
          >
            {isImporting
              ? (
                  <Loader2 className='mr-2 h-3 w-3 animate-spin' />
                )
              : (
                  <Upload className='mr-2 h-3 w-3' />
                )}
            Импорт данных
          </Button>
        </div>
      </div>

      <div className='text-xs text-muted-foreground'>
        <div className='flex items-start gap-2'>
          <AlertCircle className='h-3 w-3 mt-0.5 flex-shrink-0' />
          <div>
            <p className='font-medium'>Внимание!</p>
            <p>При импорте все существующие данные будут заменены. Убедитесь, что у вас есть резервная копия.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
