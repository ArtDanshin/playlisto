import type { Playlist as PlaylistInfo} from '@/infrastructure/storage/playlisto-db';

export interface PlaylistoDBService {
  init: () => Promise<void>;
  // Пояснение - Возвращает ключ обложки
  addCoverByURL: (url: string, key?: string) => Promise<string>;
  createPlaylist: (playlist: Playlist) => Promise<void>;
};

export type Playlist = PlaylistInfo;