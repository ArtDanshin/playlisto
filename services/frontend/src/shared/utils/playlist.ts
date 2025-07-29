import type { Track } from '@/shared/types';
import type { SpotifyTrackDataResponse } from '@/infrastructure/api/spotify';
import { playlistoDB } from '@/infrastructure/storage/playlisto-db';

import { fetchImageAsBase64 } from './image-utils';

/**
 * Обновляет трек данными из Spotify
 */
export async function updateTrackWithSpotify(
  track: Track,
  spotifyTrack: SpotifyTrackDataResponse,
): Promise<Track> {
  // Выбираем наименьшую картинку для обложки
  const imagesSorted = [...spotifyTrack.album.images].sort((a, b) => a.width - b.width);
  const smallestImage = imagesSorted[0];

  let { coverKey } = track;
  if (smallestImage?.url && !coverKey) {
    // Сохраняем base64 в IndexedDB только если обложки еще нет
    try {
      const base64 = await fetchImageAsBase64(smallestImage.url);
      coverKey = smallestImage.url;
      await playlistoDB.addCover(smallestImage.url, base64);
    } catch {
      // Игнорируем ошибки загрузки обложки
    }
  }

  const spotifyData: SpotifyData = {
    id: spotifyTrack.id,
    title: spotifyTrack.name,
    artist: spotifyTrack.artists[0]?.name || 'Unknown Artist',
    album: spotifyTrack.album.name,
    coverUrl: smallestImage?.url || '',
    duration: spotifyTrack.duration_ms || 0,
  };

  return {
    ...track,
    album: spotifyTrack.album.name, // Обновляем альбом из Spotify
    coverKey,
    spotifyData,
  };
}

/**
 * Создает ключ для сравнения треков
 */
export function createTrackKey(track: Track): string {
  return `${track.artist.toLowerCase().trim()}-${track.title.toLowerCase().trim()}`;
}

/**
 * Проверяем точное совпадение треков
 */
export function isExactMatch(track: Track, spotifyTrack: SpotifyTrackDataResponse): boolean {
  const trackKey = createTrackKey(track);
  const spotifyKey = `${spotifyTrack.artists[0]?.name.toLowerCase().trim()}-${spotifyTrack.name.toLowerCase().trim()}`;

  return trackKey === spotifyKey;
}

/**
 * Получаем длительность трека в секундах
 */
export function getTrackDuration(track: Track): number | undefined {
  if (track.m3uData?.duration) {
    return track.m3uData.duration;
  }
  // Для Spotify данных длительность в миллисекундах, конвертируем в секунды
  if (track.spotifyData?.duration) {
    return Math.round(track.spotifyData.duration / 1000);
  }
  return undefined;
}

/**
 * Получаем Spotify ID трека
 */
export function getSpotifyId(track: Track): string | undefined {
  return track.spotifyData?.id;
}

/**
 * Проверяем, связан ли трек со Spotify
 */
export function isTrackLinkedToSpotify(track: Track): boolean {
  return !!track.spotifyData?.id;
}

/**
 * Получаем список всех сервисов, информация из которых есть в треке
 */
export function getTrackServices(track: Track): Array<'spotify' | 'm3u'> {
  const services: Array<'spotify' | 'm3u'> = [];
  
  if (track.spotifyData) {
    services.push('spotify');
  }
  if (track.m3uData) {
    services.push('m3u');
  }

  return services;
}

/**
 * Получаем список всех внешних сервисов, информация из которых есть в треке
 */
export function getTrackExternalServices(track: Track): Array<'spotify'> {
  const services: Array<'spotify' | 'm3u'> = getTrackServices(track);
  
  return services.filter((service) => service !== 'm3u');
}

/**
 * Проверяем сторонний ли сервис или нет
 */
export function isExternalServices(service: string = ''): boolean {
  return ['spotify'].includes(service);
}

/**
 * Генерируем ключ для обложки в формате ${service}_${имя_файла}
 */
export function createCoverKey(service: string, url: string): string {
  const match = url.match(/\/([^\/]+)$/);
  const fileName = match ? match[1] : '';

  return `${service}_${fileName}`;
}
