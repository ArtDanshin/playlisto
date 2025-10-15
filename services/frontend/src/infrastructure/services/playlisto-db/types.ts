import type { Playlist, CoverData } from '@/infrastructure/storage/playlisto-db';

export type { Playlist, CoverData } from '@/infrastructure/storage/playlisto-db';

export interface PlaylistoDBService {
  init: () => Promise<void>;
  getAllPlaylists: () => Promise<Playlist[]>;
  getPlaylistById: (id: number) => Promise<Playlist | undefined>;
  // Возвращает ключ обложки
  addCoverByURL: (url: string, key?: string) => Promise<string>;
  addCoverByBase64: (base64: string, key: string) => Promise<void>;
  createPlaylist: (playlist: Playlist) => Promise<void>;
  deletePlaylist: (playlist: Playlist) => Promise<void>;
  updatePlaylist: (playlist: Playlist) => Promise<void>;
  updatePlaylistWithCoverLoad: (playlist: Playlist) => Promise<Playlist>;
  updatePlaylistInfo: (playlist: Playlist, updates: Pick<Playlist, 'name' | 'description' | 'coverKey'>) => Promise<Playlist>;
  getCover: (key: string) => Promise<CoverData | undefined>;
  exportDatabase: () => Promise<DatabaseDump>;
  importDatabase: (dump: DatabaseDump) => Promise<void>;
};

export interface DatabaseDump {
  version: string;
  timestamp: string;
  playlists: Playlist[];
  covers: Array<CoverData>;
}
