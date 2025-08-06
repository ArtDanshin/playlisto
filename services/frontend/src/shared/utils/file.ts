import type { Track, TrackM3UData } from '../types/playlist';

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

/**
 * Конвертация списка треков в файл плейлиста формата m3u
 */
export function exportToM3UFile(filename: string, tracks: Track[]) {
  const tracksWithM3UData = tracks.filter((track) => track.m3uData);

  if (tracksWithM3UData.length === 0) {
    throw new Error('Нет треков с данными файлов для экспорта');
  }

  // Создаем содержимое M3U файла
  const m3uContent = [
    '#EXTM3U',
    ...tracksWithM3UData.map((track) => {
      const m3uData = track.m3uData!;
      const duration = Math.floor(m3uData.duration);
      return `#EXTINF:${duration},${m3uData.artist} - ${m3uData.title}\n${m3uData.url}`;
    }),
  ].join('\n');

  // Создаем Blob и скачиваем файл
  const blob = new Blob([m3uContent], { type: 'application/x-mpegurl' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.m3u8`;
  document.body.append(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};
