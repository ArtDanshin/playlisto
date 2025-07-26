import { playlistoDB } from '@/infrastructure/storage/playlisto-db';

import type { PlaylistoDBService as PlaylistoDBServiceImp } from './types';

class PlaylistoDBService implements PlaylistoDBServiceImp {
  async init(): Promise<void> {
    return playlistoDB.init();
  }
}

// Создаем глобальный экземпляр базы данных
export const service = PlaylistoDBService;
