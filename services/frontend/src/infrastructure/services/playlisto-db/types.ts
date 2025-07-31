import type { Playlist, Track } from '@/infrastructure/storage/playlisto-db';

export type { Playlist, Track } from '@/infrastructure/storage/playlisto-db';

export interface PlaylistoDBService {
  init: () => Promise<void>;
  // Пояснение - Возвращает ключ обложки
  addCoverByURL: (url: string, key?: string) => Promise<string>;
  createPlaylist: (playlist: Playlist) => Promise<void>;
  updatePlaylistWithCoverLoad: (playlist: Playlist) => Promise<Playlist>;
  mergePlaylistTracks: (playlist: Playlist, mergeTracks: Track[], mergeOptions: MergeOptions) => Promise<{ playlist: Playlist, newTracks: Track[] }>;
};

export interface MergeOptions {
  addNewTracks: boolean;
  removeMissingTracks: boolean;
  syncOrder: boolean;
  source: string;
}