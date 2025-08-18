import { spotifyApi } from '@/infrastructure/api/spotify';
import { SPOTIFY_STORAGE_KEYS } from '@/infrastructure/configs/spotify';
import { extractPlaylistId, extractTrackIdFromUrl, isExactSpotifyMatch, updateTrackDataFromSpotify } from '@/shared/utils/spotify';
import type { Playlist, Track } from '@/shared/types/playlist';

import type {
  SpotifyService as SpotifyServiceImp,
  SpotifyPlaylistInfoResponse,
  SpotifyTrackDataResponse,
  MatchedTracks,
} from './types';

class SpotifyService implements SpotifyServiceImp {
  // Методы для работы с Client ID
  getClientId(): string {
    const localClientId = localStorage.getItem(SPOTIFY_STORAGE_KEYS.CLIENT_ID);
    return localClientId && localClientId.trim() ? localClientId : '';
  }

  setClientId(clientId: string): void {
    if (!clientId.trim()) {
      throw new Error('Client ID не может быть пустым');
    }
    localStorage.setItem(SPOTIFY_STORAGE_KEYS.CLIENT_ID, clientId.trim());
  }

  hasClientId(): boolean {
    return !!this.getClientId();
  }

  // Методы авторизации
  async initiateAuth(): Promise<void> {
    return spotifyApi.initiateAuth();
  }

  async handleCallback(): Promise<boolean> {
    return spotifyApi.handleCallback();
  }

  async refreshToken(): Promise<boolean> {
    return spotifyApi.refreshToken();
  }

  logout(): void {
    spotifyApi.logout();
  }

  getAuthStatus() {
    return spotifyApi.getAuthStatus();
  }

  async fetchUserProfile() {
    return spotifyApi.fetchUserProfile();
  }

  async getPlaylistInfoByURL(spotifyPlaylistURL: string): Promise<SpotifyPlaylistInfoResponse> {
    const playlistId = extractPlaylistId(spotifyPlaylistURL);

    if (!playlistId) {
      throw new Error(`Неверный форма URL. Исходный URL: ${spotifyPlaylistURL}`);
    }

    return await spotifyApi.getPlaylistInfo(playlistId);
  }

  // Получение всех треков плейлиста по его URL
  async getPlaylistTracksByURL(spotifyPlaylistURL: string): Promise<SpotifyTrackDataResponse[]> {
    const playlistId = extractPlaylistId(spotifyPlaylistURL);

    if (!playlistId) {
      throw new Error(`Неверный форма URL. Исходный URL: ${spotifyPlaylistURL}`);
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

  // Получение всех треков плейлиста по его URL
  async getTrackByURL(spotifyTrackURL: string): Promise<SpotifyTrackDataResponse> {
    const trackId = extractTrackIdFromUrl(spotifyTrackURL);

    if (!trackId) {
      throw new Error(`Неверный форма URL. Исходный URL: ${spotifyTrackURL}`);
    }

    return await spotifyApi.getTrack(trackId);
  }

  // Поиск треков в Spotify
  async searchTracks(artist: string, title: string): Promise<SpotifyTrackDataResponse[]> {
    const query = `${artist} ${title}`.trim();
    const response = await spotifyApi.searchTracks(query, 10);

    return response.tracks.items;
  }

  // Поиск и сопоставление треков в Spotify
  async searhAndMatchTracks(
    tracks: Track[],
    onProcess?: (current: number, total: number) => void,
  ): Promise<MatchedTracks> {
    let processedCount = 0;
    const toProcessTracksCount = tracks.reduce((total, track) => {
      if (!track.spotifyData) {
        return ++total;
      }

      return total;
    }, 0);
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
          resultTracks.push(track);
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
      notUpdatedTracks,
    };
  }

  async createPlaylist(playlist: Playlist): Promise<SpotifyPlaylistInfoResponse> {
    const playlistData = await spotifyApi.createPlaylist(playlist.name);

    await this.updatePlaylistTracks(playlistData.id, playlist.tracks);

    // TODO: Обработать ошибки API

    return playlistData;
  }

  async updatePlaylistTracks(playlistId: string, tracks: Track[]): Promise<void> {
    const trackUris = tracks
      .filter((track) => track.spotifyData?.id)
      .map((track) => `spotify:track:${track.spotifyData?.id}`);

    await spotifyApi.updatePlaylistTracks(playlistId, trackUris);

    // TODO: Обработать ошибки API
  }
}

export const service = SpotifyService;
