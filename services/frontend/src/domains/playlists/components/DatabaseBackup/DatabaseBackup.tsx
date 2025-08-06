'use client';

import { useState } from 'react';
import {
  Database, Download, Upload, Loader2, AlertCircle,
} from 'lucide-react';

import { Button } from '@/shared/components/ui/Button';
import { playlistoDBService } from '@/infrastructure/services/playlisto-db';
import { downloadDatabaseDump, readDatabaseDumpFromFile } from '@/shared/utils/playlist';

import { usePlaylistStore } from '../../store';

function DatabaseBackup() {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { loadPlaylists } = usePlaylistStore();

  const handleExport = async () => {
    setError(null);
    setIsExporting(true);
    try {
      const dump = await playlistoDBService.exportDatabase();
      downloadDatabaseDump(dump);
    } catch (error: any) {
      setError(error.message || 'Ошибка экспорта базы данных');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);

    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const dump = await readDatabaseDumpFromFile(file);

      await playlistoDBService.importDatabase(dump);
      await loadPlaylists(); // Перезагружаем плейлисты
    } catch (error: any) {
      setError(error.message || 'Ошибка импорта базы данных');
    } finally {
      setIsImporting(false);
      // Очищаем input для возможности повторного выбора того же файла
      event.target.value = '';
    }
  };

  return (
    <div className='space-y-3'>
      <div className='flex items-center gap-2'>
        <Database className='h-4 w-4' />
        <span className='font-medium'>База данных</span>
      </div>
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

      {error && (
        <div className='text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded'>
          Ошибка:
          {' '}
          {error}
        </div>
      )}
    </div>
  );
}

export default DatabaseBackup;
