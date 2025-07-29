import type { SpotifyTrackDataResponse, SpotifyPlaylistInfoResponse } from '@/infrastructure/api/spotify';
import type { Track } from '@/shared/types/playlist';

export type { SpotifyTrackDataResponse, SpotifyPlaylistInfoResponse } from '@/infrastructure/api/spotify';

export interface SpotifyService {
  getPlaylistInfoByURL: (spotifyPlaylistURL: string) => Promise<SpotifyPlaylistInfoResponse>;
  getPlaylistTracksByURL: (spotifyPlaylistURL: string) => Promise<SpotifyTrackDataResponse[]>;
  searhAndMatchTracks: (tracks: Track[], onProcess?: (current: number, total: number) => void) => Promise<MatchedTracks>
}

export interface MatchedTracks {
  allTracks: Track[],
  onlyUpdatedTracks: Track[],
  notUpdatedTracks: Track[],
}