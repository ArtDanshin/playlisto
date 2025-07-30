import type { Track, TrackM3UData } from "../types/playlist";

export function extractArtistAndTitle(trackInfo: string): { artist: string; title: string; } {
  const dashIndex = trackInfo.indexOf(' - ');

  if (dashIndex !== -1) {
    return {
      artist: trackInfo.slice(0, Math.max(0, dashIndex)).trim(),
      title: trackInfo.slice(Math.max(0, dashIndex + 3)).trim(),
    };
  }

  // If no dash found, treat the whole string as title
  return {
    artist: 'Unknown Artist',
    title: trackInfo.trim(),
  };
}

/**
 * Проверяем точное совпадение треков
 */
export function isExactM3UMatch(artist: string, title: string, M3UTrackData: TrackM3UData): boolean {
  const isArtistEqual = artist.toLowerCase().trim() === M3UTrackData.artist.toLowerCase().trim();
  const isTitleEqual = title.toLowerCase().trim() === M3UTrackData.title.toLowerCase().trim();

  return isArtistEqual && isTitleEqual;
}

/**
 * Обновляем информацию о треке из M3U данных
 */
export function updateTrackDataFromM3U(track: Track, M3UTrackData: TrackM3UData): Track {
  return {
    ...track,
    title: track.title || M3UTrackData.title,
    artist: track.artist || M3UTrackData.artist || 'Unknown Artist',
    duration: track.duration || M3UTrackData.duration,
    m3uData: M3UTrackData,
  };
}