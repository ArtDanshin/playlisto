import type { SpotifyTrackDataResponse } from '@/infrastructure/services/spotify';
import { createTrackDataFromSpotify } from '@/shared/utils/spotify';
import type { Playlist } from '@/shared/types/playlist';

/**
 * Формируем информацию о новом плейлисте
 */
export function createPlaylistFromSpotify(name: string, spotifyTracks: SpotifyTrackDataResponse[]): Playlist {
  return {
    name: name || 'New playlist',
    order: 0,
    tracks: spotifyTracks.map(createTrackDataFromSpotify)
  }
}
