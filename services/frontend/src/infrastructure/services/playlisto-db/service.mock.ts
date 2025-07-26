import type { PlaylistoDBService as PlaylistoDBServiceImp } from './types';

class PlaylistoDBService implements PlaylistoDBServiceImp {
  async init(): Promise<void> {
    return new Promise(() => {});
  }
}

// Создаем глобальный экземпляр базы данных
export const service = PlaylistoDBService;
