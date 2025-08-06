import type { Playlist, Track, TrackM3UData } from '@/shared/types/playlist';

/**
 * Формируем информацию о новом плейлисте
 */
export function createPlaylistFromFile(name: string, m3uTrack: TrackM3UData[]): Playlist {
  return {
    name: name || 'New playlist',
    order: 0,
    tracks: m3uTrack.map(covertTrackFromM3U),
  };
}

/**
 * Преобразуем информацию о треке из M3U данных
 */
export function covertTrackFromM3U(m3uData: TrackM3UData, position: number): Track {
  return {
    title: m3uData.title,
    artist: m3uData.artist,
    album: '', // M3U не содержит информацию об альбоме
    duration: m3uData.duration,
    position,
    coverKey: '', // M3U не содержит обложки
    m3uData,
  };
}
