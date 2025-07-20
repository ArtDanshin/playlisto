import type { Playlist } from '@/shared/types';

import { playlistDB } from './indexed-db';

export interface DatabaseDump {
  version: string;
  timestamp: string;
  playlists: Playlist[];
  covers: Array<{ url: string; base64: string; }>;
}

/**
 * Экспортирует всю базу данных в JSON формат
 */
export async function exportDatabase(): Promise<DatabaseDump> {
  // Получаем все плейлисты
  const playlists = await playlistDB.getAllPlaylists();

  // Получаем все обложки
  const covers = await getAllCovers();

  const dump: DatabaseDump = {
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    playlists,
    covers,
  };

  return dump;
}

/**
 * Импортирует данные из JSON файла в базу данных
 */
export async function importDatabase(dump: DatabaseDump): Promise<void> {
  // Проверяем версию дампа
  if (!dump.version || !dump.playlists || !dump.covers) {
    throw new Error('Неверный формат файла дампа');
  }

  // Очищаем существующие данные
  await clearDatabase();

  // Импортируем обложки
  for (const cover of dump.covers) {
    await playlistDB.addCover(cover.url, cover.base64);
  }

  // Импортируем плейлисты
  for (const playlist of dump.playlists) {
    await playlistDB.addPlaylist(playlist);
  }
}

/**
 * Получает все обложки из базы данных
 */
async function getAllCovers(): Promise<Array<{ url: string; base64: string; }>> {
  return await playlistDB.getAllCovers();
}

/**
 * Очищает всю базу данных
 */
async function clearDatabase(): Promise<void> {
  return await playlistDB.clearDatabase();
}

/**
 * Создает файл для скачивания с дампом базы данных
 */
export function downloadDatabaseDump(dump: DatabaseDump): void {
  const blob = new Blob([JSON.stringify(dump, null, 2)], {
    type: 'application/json',
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `playlisto-dump-${new Date().toISOString().split('T')[0]}.json`;
  document.body.append(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/**
 * Читает файл дампа из input элемента
 */
export async function readDatabaseDumpFromFile(file: File): Promise<DatabaseDump> {
  try {
    const content = await file.text();
    const dump = JSON.parse(content) as DatabaseDump;
    return dump;
  } catch {
    throw new Error('Неверный формат файла');
  }
}
