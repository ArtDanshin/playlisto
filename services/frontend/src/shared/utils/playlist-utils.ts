import type { Track, M3UData, SpotifyData, SpotifyTrackData } from '@/shared/types';
import { playlistDB } from '@/infrastructure/storage/indexed-db';

import { fetchImageAsBase64 } from './image-utils';

/**
 * Создает трек из M3U данных
 */
export function createTrackFromM3U(m3uData: M3UData, position: number): Track {
  return {
    title: m3uData.title,
    artist: m3uData.artist,
    album: '', // M3U не содержит информацию об альбоме
    position,
    coverKey: '', // M3U не содержит обложки
    m3uData,
  };
}

/**
 * Создает трек из Spotify данных
 */
export async function createTrackFromSpotify(
  spotifyTrack: SpotifyTrackData,
  position: number,
  existingTrack?: Track,
): Promise<Track> {
  // Выбираем наименьшую картинку для обложки
  const imagesSorted = [...spotifyTrack.album.images].sort((a, b) => a.width - b.width);
  const smallestImage = imagesSorted[0];

  let coverKey = '';
  if (smallestImage?.url) {
    // Сохраняем base64 в IndexedDB
    try {
      const base64 = await fetchImageAsBase64(smallestImage.url);
      // Используем URL как ключ для обложки
      coverKey = smallestImage.url;
      await playlistDB.addCover(smallestImage.url, base64);
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
    title: existingTrack?.title || spotifyTrack.name,
    artist: existingTrack?.artist || spotifyTrack.artists[0]?.name || 'Unknown Artist',
    album: spotifyTrack.album.name,
    position,
    coverKey,
    spotifyData,
    m3uData: existingTrack?.m3uData,
  };
}

/**
 * Обновляет трек данными из Spotify
 */
export async function updateTrackWithSpotify(
  track: Track,
  spotifyTrack: SpotifyTrackData,
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
      await playlistDB.addCover(smallestImage.url, base64);
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
 * Проверяет точное совпадение треков
 */
export function isExactMatch(track: Track, spotifyTrack: SpotifyTrackData): boolean {
  const trackKey = createTrackKey(track);
  const spotifyKey = `${spotifyTrack.artists[0]?.name.toLowerCase().trim()}-${spotifyTrack.name.toLowerCase().trim()}`;

  return trackKey === spotifyKey;
}

/**
 * Получает длительность трека в секундах
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
 * Получает Spotify ID трека
 */
export function getSpotifyId(track: Track): string | undefined {
  return track.spotifyData?.id;
}

/**
 * Проверяет, связан ли трек со Spotify
 */
export function isTrackLinkedToSpotify(track: Track): boolean {
  return !!track.spotifyData?.id;
}
