import type { PlaylistoDBService as PlaylistoDBServiceImp, Playlist, DatabaseDump } from './types';

class PlaylistoDBService implements PlaylistoDBServiceImp {
  async init(): Promise<void> {
    return new Promise(() => {});
  }

  async addCoverByURL(url: string, key?: string): Promise<string> {
    return key || url;
  }

  async createPlaylist(): Promise<void> {
    return;
  }

  async updatePlaylistWithCoverLoad(playlist: Playlist): Promise<Playlist> {
    return playlist;
  }

  async exportDatabase(): Promise<DatabaseDump> {
    return {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      playlists: [],
      covers: [],
    };
  }

  async importDatabase(_: DatabaseDump): Promise<void> {
    return;
  
}

// Создаем глобальный экземпляр базы данных
export const service = PlaylistoDBService;
