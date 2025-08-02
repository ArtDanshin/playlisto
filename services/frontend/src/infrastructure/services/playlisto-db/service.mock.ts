import type { PlaylistoDBService as PlaylistoDBServiceImp, Playlist, Track } from './types';

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
}

// Создаем глобальный экземпляр базы данных
export const service = PlaylistoDBService;
