import type { PlaylistoDBService as PlaylistoDBServiceImp, Playlist } from './types';

class PlaylistoDBService implements PlaylistoDBServiceImp {
  async init(): Promise<void> {
    return new Promise(() => {});
  }

  async addCoverByURL(url: string, key?: string): Promise<string> {
    return key || url;
  }

  async createPlaylist(playlist: Playlist): Promise<void> {
    return;
  }
}

// Создаем глобальный экземпляр базы данных
export const service = PlaylistoDBService;
