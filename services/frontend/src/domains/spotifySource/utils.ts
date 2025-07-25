import type { SpotifyTrackData } from '@/infrastructure/services/spotify';
import type { Playlist, Track } from '@/shared/types/playlist';

/**
 * Формируем информацию о новом плейлисте
 */
export function createPlaylistFromSpotify(name: string, spotifyTracks: SpotifyTrackData[]): Playlist {
  return {
    name: name || 'New playlist',
    order: 0,
    tracks: spotifyTracks.map(covertTrackFromM3U)
  }
}

/**
 * Преобразуем информацию о треке из Spotify данных
 */
export function covertTrackFromM3U(spotifyData: SpotifyTrackData, position: number): Track {
  return {
    title: spotifyData.name,
    artist: spotifyData.artists[0]?.name || 'Unknown Artist',
    album: spotifyData.album?.name || '',
    duration: spotifyData.duration_ms,
    position,
    coverKey: '',
    spotifyData: {
      id: spotifyData.id,
      title: spotifyData.name,
      artist: spotifyData.artists[0]?.name || 'Unknown Artist',
      album: spotifyData.album?.name || '',
      coverUrl: spotifyData.album?.images?.[0]?.url || '',
      duration: spotifyData.duration_ms || 0,
    },
  };
}
