import type { SpotifyTrackData, SpotifyPlaylistInfoResponse } from '@/infrastructure/api/spotify';

export type { SpotifyTrackData } from '@/infrastructure/api/spotify';

export interface SpotifyService {
  getPlaylistInfoByURL: (spotifyPlaylistURL: string) => Promise<SpotifyPlaylistInfo>;
  getPlaylistTracksByURL: (spotifyPlaylistURL: string) => Promise<SpotifyTrackData[]>;
}

export type SpotifyPlaylistInfo = SpotifyPlaylistInfoResponse;