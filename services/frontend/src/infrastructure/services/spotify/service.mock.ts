import { extractPlaylistId } from '@/shared/utils/spotify';

import type { SpotifyService as SpotifyServiceImp, SpotifyPlaylistInfo, SpotifyTrackData } from './types';

class SpotifyService implements SpotifyServiceImp {
  async getPlaylistInfoByURL(spotifyPlaylistURL: string): Promise<SpotifyPlaylistInfo> {
    console.log('Service SpotifyService. Method getPlaylistInfoByURL. Params:', spotifyPlaylistURL);

    const playlistId = extractPlaylistId(spotifyPlaylistURL);

    if (!playlistId) {
      throw new Error(`Неверный форма URL. Исходный URL: ${spotifyPlaylistURL}`)
    }

    return {
      name: 'MusicMelomanPlaylist',
      owner: {
        id: 'music_meloman'
      }
    }
  }

  // Получение конкретного плейлиста
  async getPlaylistTracksByURL(spotifyPlaylistURL: string): Promise<SpotifyTrackData[]> {
    const playlistId = extractPlaylistId(spotifyPlaylistURL);

    if (!playlistId) {
      throw new Error(`Неверный форма URL. Исходный URL: ${spotifyPlaylistURL}`)
    }

    console.log('Service SpotifyService. Method getPlaylistTracksByURL. Params:', spotifyPlaylistURL);
    return [];
  }
}

export const service = SpotifyService;
