import type { Playlist, Track } from '@/shared/types';
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

/**
 * Формирование ключа трека, для их сопоставление
 * Для разных сервисов они могут иметь разный вид и состоять из своих данных 
 */
export function getMatchKeyBySource(track: Track, service: string): string {
  if (service === 'spotify' && track.spotifyData?.id) {
    return track.spotifyData.id
  }

  return createTrackKey(track)
}

/**
 * Сравнение двух треклистов по составу и вывод различий
 */
export function getTracksComparison(
  tracks1: Track[],
  tracks2: Track[],
  service: string,
): {
  addTracks: Track[],
  missingTracks: Track[],
  commonTracks: Track[],
  hasOrderDifference: boolean
} {
  const tracks1Keys = new Set(tracks1.map((t) => getMatchKeyBySource(t, service)));
  const tracks2Keys = new Set(tracks2.map((t) => getMatchKeyBySource(t, service)));

  // Новые треки - есть во втором массиве треков, но нет в первом
  const addTracks = tracks2.filter((t) => !tracks1Keys.has(getMatchKeyBySource(t, service)));

  // Отсутствующие треки - есть в первом массиве треков, но нет во втором
  const missingTracks = tracks1.filter((t) => !tracks2Keys.has(getMatchKeyBySource(t, service)));

  // Общие треки - есть и в обоих массивах треков
  const commonTracks = tracks1.filter((t) => tracks2Keys.has(getMatchKeyBySource(t, service)));

  // Проверяем различия в порядке треков
  // Получаем массивы общих треков по ключу из первого и второго исходных и сравниваем их
  const commonTracks1Keys = commonTracks.map((t: Track) => getMatchKeyBySource(t, service));
  const commonTracks2Keys = tracks2
    .filter((t) => tracks1Keys.has(getMatchKeyBySource(t, service)))
    .map((t) => t.spotifyData?.id);

  const hasOrderDifference = commonTracks.length > 0
    && JSON.stringify(commonTracks1Keys) !== JSON.stringify(commonTracks2Keys);

  return {
    addTracks,
    missingTracks,
    commonTracks,
    hasOrderDifference,
  };
};

export interface MergeTracksOptions {
  addNewTracks: boolean;
  removeMissingTracks: boolean;
  syncOrder: boolean;
  source: string;
}

// TODO: поправить логику склеивания данный треков, на более универсальную
export function mergeTracks(
  currentTracks: Track[],
  mergeTracks: Track[],
  mergeOptions: MergeTracksOptions
): {
  mergedTracks: Track[],
  newTracks: Track[]
} {
  const existingTracks = [...currentTracks];
  const uploadedTracks = [...mergeTracks];

  // Создаем Map для быстрого поиска треков по ключу
  const existingTracksMap = new Map<string, Track>();
  const uploadedTracksMap = new Map<string, Track>();

  existingTracks.forEach((track) => {
    const trackKey = getMatchKeyBySource(track, mergeOptions.source);
    existingTracksMap.set(trackKey, track);
  });

  uploadedTracks.forEach((track) => {
    const trackKey = getMatchKeyBySource(track, mergeOptions.source);
    uploadedTracksMap.set(trackKey, track);
  });

  let mergedTracks: Track[] = [];
  let newTracks: Track[] = [];

  if (mergeOptions.syncOrder) {
    // Синхронизируем порядок как в загруженном плейлисте
    mergedTracks = uploadedTracks.map((uploadedTrack, index) => {
      const trackKey = getMatchKeyBySource(uploadedTrack, mergeOptions.source);
      const existingTrack = existingTracksMap.get(trackKey);
      if (existingTrack) {
        // Сохраняем существующие данные (Spotify, обложки и т.д.)
        return {
          ...uploadedTrack,
          position: index + 1,
          spotifyData: existingTrack.spotifyData,
          coverKey: existingTrack.coverKey,
          album: existingTrack.album,
          m3uData: existingTrack.m3uData,
        };
      }
      // Новый трек
      return {
        ...uploadedTrack,
        position: index + 1,
      };
    });

    // Добавляем треки, которых нет в загруженном плейлисте, в конец
    if (mergeOptions.addNewTracks) {
      const missingTracks = existingTracks.filter((existingTrack) => {
        const trackKey = getMatchKeyBySource(existingTrack, mergeOptions.source);
        return !uploadedTracksMap.has(trackKey);
      });
      const missingTracksWithUpdatedPositions = missingTracks.map((track, index) => ({
        ...track,
        position: mergedTracks.length + index + 1,
      }));
      mergedTracks.push(...missingTracksWithUpdatedPositions);
      newTracks.push(...missingTracksWithUpdatedPositions);
    }
  } else {
    // Простое объединение без изменения порядка
    mergedTracks = [...existingTracks];

    if (mergeOptions.addNewTracks) {
      // Добавляем новые треки в конец
      uploadedTracks.forEach((uploadedTrack) => {
        const trackKey = getMatchKeyBySource(uploadedTrack, mergeOptions.source);
        if (existingTracksMap.has(trackKey)) {
          // Обновляем существующий трек данными из загруженного источника
          const existingTrackIndex = mergedTracks.findIndex((t) => getMatchKeyBySource(t, mergeOptions.source) === trackKey);
          if (existingTrackIndex !== -1) {
            const existingTrack = mergedTracks[existingTrackIndex];
            mergedTracks[existingTrackIndex] = {
              ...existingTrack,
              ...uploadedTrack,
              // Сохраняем данные внешних сервисов
              spotifyData: existingTrack.spotifyData || uploadedTrack.spotifyData,
              m3uData: existingTrack.m3uData || uploadedTrack.m3uData,
              coverKey: existingTrack.coverKey || uploadedTrack.coverKey,
            };
          }
        } else {
          const newTrack = {
            ...uploadedTrack,
            position: mergedTracks.length + 1,
          };
          mergedTracks.push(newTrack);
          newTracks.push(newTrack);
        }
      });
    }
  }

  if (mergeOptions.removeMissingTracks) {
    // Удаляем треки, которых нет в загруженном плейлисте
    mergedTracks = mergedTracks.filter((track) => {
      const trackKey = getMatchKeyBySource(track, mergeOptions.source);
      return uploadedTracksMap.has(trackKey);
    });
  }

  return {
    mergedTracks,
    newTracks,
  }
}