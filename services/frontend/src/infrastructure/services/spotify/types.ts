import type { SpotifyTrackDataResponse, SpotifyPlaylistInfoResponse } from '@/infrastructure/api/spotify';
import type { Playlist, Track } from '@/shared/types/playlist';

export type { SpotifyTrackDataResponse, SpotifyPlaylistInfoResponse } from '@/infrastructure/api/spotify';

export interface SpotifyService {
  // Методы для работы с Client ID
  getClientId: () => string;
  setClientId: (clientId: string) => void;
  hasClientId: () => boolean;

  // Методы авторизации
  initiateAuth: () => Promise<void>;
  handleCallback: () => Promise<boolean>;
  refreshToken: () => Promise<boolean>;
  logout: () => void;
  getAuthStatus: () => { isAuthenticated: boolean; user: any; expiresAt: number | null; };
  fetchUserProfile: () => Promise<any>;

  // Методы для работы с плейлистами и треками
  getPlaylistInfoByURL: (spotifyPlaylistURL: string) => Promise<SpotifyPlaylistInfoResponse>;
  getPlaylistTracksByURL: (spotifyPlaylistURL: string) => Promise<SpotifyTrackDataResponse[]>;
  getTrackByURL: (spotifyTrackURL: string) => Promise<SpotifyTrackDataResponse>;
  searchTracks: (artist: string, title: string) => Promise<SpotifyTrackDataResponse[]>;
  searhAndMatchTracks: (tracks: Track[], onProcess?: (current: number, total: number) => void) => Promise<MatchedTracks>;
  createPlaylist: (playlist: Playlist) => Promise<SpotifyPlaylistInfoResponse>;
  updatePlaylistTracks: (playlistId: string, tracks: Track[]) => Promise<void>;
}

export interface MatchedTracks {
  allTracks: Track[];
  onlyUpdatedTracks: Track[];
  notUpdatedTracks: Track[];
}
