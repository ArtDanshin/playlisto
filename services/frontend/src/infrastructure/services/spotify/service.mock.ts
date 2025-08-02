import { extractPlaylistId } from '@/shared/utils/spotify';
import type { Playlist, Track } from '@/shared/types/playlist';

import type { 
  SpotifyService as SpotifyServiceImp,
  SpotifyPlaylistInfoResponse,
  SpotifyTrackDataResponse,
  MatchedTracks
} from './types';

class SpotifyService implements SpotifyServiceImp {
  async getPlaylistInfoByURL(spotifyPlaylistURL: string): Promise<SpotifyPlaylistInfoResponse> {
    console.log('Service SpotifyService. Method getPlaylistInfoByURL. Params:', spotifyPlaylistURL);

    const playlistId = extractPlaylistId(spotifyPlaylistURL);

    if (!playlistId) {
      throw new Error(`Неверный форма URL. Исходный URL: ${spotifyPlaylistURL}`)
    }

    return {
      name: 'MusicMelomanPlaylist',
      id: 'qwerty42',
      owner: {
        id: 'music_meloman'
      }
    }
  }

  async getPlaylistTracksByURL(spotifyPlaylistURL: string): Promise<SpotifyTrackDataResponse[]> {
    const playlistId = extractPlaylistId(spotifyPlaylistURL);

    if (!playlistId) {
      throw new Error(`Неверный форма URL. Исходный URL: ${spotifyPlaylistURL}`)
    }

    console.log('Service SpotifyService. Method getPlaylistTracksByURL. Params:', spotifyPlaylistURL);
    return [];
  }

  async searhAndMatchTracks(
    _: Track[],
    onProcess?: (current: number, total: number) => void
  ): Promise<MatchedTracks> {
    let processedCount = 0;
    const toProcessTracksCount = 10
    const updatedTracks: Track[] = [];

    onProcess && onProcess(processedCount, toProcessTracksCount);

    while (processedCount < 10) {
      await new Promise<void>((resolve) => setTimeout(() => {
        processedCount++;
        onProcess && onProcess(processedCount, toProcessTracksCount);

        // TODO: Добавить mock структуры трека
        updatedTracks.push({} as Track);
        resolve();
      }, 200));
    }

    return {
      allTracks: [],
      onlyUpdatedTracks: [],
      notUpdatedTracks: []
    };
  }

  async createPlaylist(_: Playlist): Promise<SpotifyPlaylistInfoResponse> {    
    return {
      name: 'MusicMelomanPlaylist',
      id: 'qwerty42',
      owner: {
        id: 'music_meloman'
      }
    }
  }

  async updatePlaylistTracks(_: string, __: Track[]): Promise<void> {
    return;
  }
}

export const service = SpotifyService;
