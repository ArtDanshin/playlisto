import { spotifyApi } from '@/infrastructure/api/spotify';
import { extractPlaylistId } from '@/shared/utils/spotify';

import type { SpotifyService as SpotifyServiceImp, SpotifyPlaylistInfo, SpotifyTrackData } from './types';

class SpotifyService implements SpotifyServiceImp {
  async getPlaylistInfoByURL(spotifyPlaylistURL: string): Promise<SpotifyPlaylistInfo> {
    const playlistId = extractPlaylistId(spotifyPlaylistURL);

    if (!playlistId) {
      throw new Error(`Неверный форма URL. Исходный URL: ${spotifyPlaylistURL}`)
    }

    return await spotifyApi.getPlaylistInfo(playlistId)
  }

  // Получение конкретного плейлиста
  async getPlaylistTracksByURL(spotifyPlaylistURL: string): Promise<SpotifyTrackData[]> {
    const playlistId = extractPlaylistId(spotifyPlaylistURL);

    if (!playlistId) {
      throw new Error(`Неверный форма URL. Исходный URL: ${spotifyPlaylistURL}`)
    }

    const allTracks: SpotifyTrackData[] = [];
    let offset = 0;
    const limit = 50;

    while (true) {
      const response = await spotifyApi.getPlaylistTracks(playlistId, offset, limit);

      if (!response.items || response.items.length === 0) {
        break; // Больше треков нет
      }

      allTracks.push(...response.items.map((item) => item.track));
      offset += limit;

      // Если получили меньше треков чем limit, значит это последняя страница
      if (response.items.length < limit) {
        break;
      }
    }

    // TODO: Обработать ошибки API

    return allTracks;
  }
}

export const service = SpotifyService;
