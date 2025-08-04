import type { Playlist, CoverData } from '@/infrastructure/storage/playlisto-db';

export type { Playlist } from '@/infrastructure/storage/playlisto-db';

export interface PlaylistoDBService {
  init: () => Promise<void>;
  // Возвращает ключ обложки
  addCoverByURL: (url: string, key?: string) => Promise<string>;
  createPlaylist: (playlist: Playlist) => Promise<void>;
  updatePlaylistWithCoverLoad: (playlist: Playlist) => Promise<Playlist>;
  exportDatabase: () => Promise<DatabaseDump>;
  importDatabase: (dump: DatabaseDump) => Promise<void>;
};

export interface DatabaseDump {
  version: string;
  timestamp: string;
  playlists: Playlist[];
  covers: Array<CoverData>;
}
