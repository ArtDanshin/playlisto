import { spotifyApi } from '@/infrastructure/api/spotify';
import { extractPlaylistId } from '@/shared/utils/spotify';
import type { Track } from '@/shared/types/playlist';
import { isExactSpotifyMatch, updateTrackDataFromSpotify } from '@/shared/utils/spotify';

import type { 
  SpotifyService as SpotifyServiceImp,
  SpotifyPlaylistInfoResponse,
  SpotifyTrackDataResponse,
  MatchedTracks
} from './types';

class SpotifyService implements SpotifyServiceImp {
  async getPlaylistInfoByURL(spotifyPlaylistURL: string): Promise<SpotifyPlaylistInfoResponse> {
    const playlistId = extractPlaylistId(spotifyPlaylistURL);

    if (!playlistId) {
      throw new Error(`Неверный форма URL. Исходный URL: ${spotifyPlaylistURL}`)
    }

    return await spotifyApi.getPlaylistInfo(playlistId)
  }

  // Получение всех треков плейлиста по его URL
  async getPlaylistTracksByURL(spotifyPlaylistURL: string): Promise<SpotifyTrackDataResponse[]> {
    const playlistId = extractPlaylistId(spotifyPlaylistURL);

    if (!playlistId) {
      throw new Error(`Неверный форма URL. Исходный URL: ${spotifyPlaylistURL}`)
    }

    const allTracks: SpotifyTrackDataResponse[] = [];
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

  // Поиск и сопоставление треков в Spotify
  async searhAndMatchTracks(
    tracks: Track[],
    onProcess?: (current: number, total: number) => void
  ): Promise<MatchedTracks> {
    let processedCount = 0;
    const toProcessTracksCount = tracks.reduce((total, track) => {
      if (!track.spotifyData) {
        return ++total;
      }

      return total;
    }, 0)
    const resultTracks: Track[] = [];
    const updatedTracks: Track[] = [];
    const notUpdatedTracks: Track[] = [];

    onProcess && onProcess(processedCount, toProcessTracksCount);

    for (const track of tracks) {
      if (track.spotifyData) {
        resultTracks.push(track);
        continue;
      }

      // Делаем задержку запроса в API, чтобы не DDOS'ить ее
      if (processedCount > 0) {
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      try {
        const query = `${track.artist} ${track.title}`.trim();
        const response = await spotifyApi.searchTracks(query, 5);

        const exactMatchTrack = response.tracks.items.find((spotifyTrack) => isExactSpotifyMatch(track.artist, track.title, spotifyTrack));

        if (exactMatchTrack) {
          const updatedTrack = updateTrackDataFromSpotify(track, exactMatchTrack);
          resultTracks.push(updatedTrack);
          updatedTracks.push(updatedTrack);
        } else {
          resultTracks.push(track)
          notUpdatedTracks.push(track);
        }
      } catch (error) {
        console.error(`Ошибка при обновлении трека "${track.artist} - ${track.title}":`, error);
        resultTracks.push(track);
      }

      processedCount++;
      onProcess && onProcess(processedCount, toProcessTracksCount);
    }

    return {
      allTracks: resultTracks,
      onlyUpdatedTracks: updatedTracks,
      notUpdatedTracks: notUpdatedTracks
    };
  }
}

export const service = SpotifyService;
