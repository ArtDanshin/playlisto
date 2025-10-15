import { extractPlaylistId } from '@/shared/utils/spotify';
import type { Track } from '@/shared/types/playlist';

import type {
  SpotifyService as SpotifyServiceImp,
  SpotifyPlaylistInfoResponse,
  SpotifyTrackDataResponse,
  MatchedTracks,
} from './types';

class SpotifyService implements SpotifyServiceImp {
  // Методы для работы с Client ID
  getClientId(): string {
    return 'mock_client_id';
  }

  setClientId(clientId: string): void {
    console.log('Mock: Setting Client ID:', clientId);
  }

  hasClientId(): boolean {
    return true;
  }

  // Методы авторизации
  async initiateAuth(): Promise<void> {
    console.log('Mock: Initiating auth');
  }

  async handleCallback(): Promise<boolean> {
    console.log('Mock: Handling callback');
    return true;
  }

  async refreshToken(): Promise<boolean> {
    console.log('Mock: Refreshing token');
    return true;
  }

  logout(): void {
    console.log('Mock: Logging out');
  }

  getAuthStatus() {
    return {
      isAuthenticated: true,
      user: { display_name: 'Mock User' },
      expiresAt: Date.now() + 3600000,
    };
  }

  async fetchUserProfile() {
    return { display_name: 'Mock User' };
  }

  async getPlaylistInfoByURL(spotifyPlaylistURL: string): Promise<SpotifyPlaylistInfoResponse> {
    console.log('Service SpotifyService. Method getPlaylistInfoByURL. Params:', spotifyPlaylistURL);

    const playlistId = extractPlaylistId(spotifyPlaylistURL);

    if (!playlistId) {
      throw new Error(`Неверный форма URL. Исходный URL: ${spotifyPlaylistURL}`);
    }

    return {
      name: 'MusicMelomanPlaylist',
      description: 'Mock description',
      id: 'qwerty42',
      owner: {
        id: 'music_meloman',
      },
      images: [],
    };
  }

  async getPlaylistTracksByURL(spotifyPlaylistURL: string): Promise<SpotifyTrackDataResponse[]> {
    const playlistId = extractPlaylistId(spotifyPlaylistURL);

    if (!playlistId) {
      throw new Error(`Неверный форма URL. Исходный URL: ${spotifyPlaylistURL}`);
    }

    console.log('Service SpotifyService. Method getPlaylistTracksByURL. Params:', spotifyPlaylistURL);
    return [];
  }

  async getTrackByURL(): Promise<SpotifyTrackDataResponse> {
    return {} as SpotifyTrackDataResponse;
  }

  async searchTracks(): Promise<SpotifyTrackDataResponse[]> {
    return [];
  }

  async searhAndMatchTracks(
    _: Track[],
    onProcess?: (current: number, total: number) => void,
  ): Promise<MatchedTracks> {
    let processedCount = 0;
    const toProcessTracksCount = 10;
    const updatedTracks: Track[] = [];

    onProcess && onProcess(processedCount, toProcessTracksCount);

    /* eslint-disable no-loop-func */
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
      notUpdatedTracks: [],
    };
  }

  async createPlaylist(): Promise<SpotifyPlaylistInfoResponse> {
    return {
      name: 'Mock Playlist',
      id: 'mock_playlist_id',
      owner: { id: 'mock_owner' },
      description: 'Mock description',
      images: [],
    };
  }

  async updatePlaylistTracks(): Promise<void> {
    return;
  }

  async updatePlaylist(): Promise<void> {
    return;
  }

  async uploadPlaylistCover(): Promise<void> {
    return;
  }
}

export const service = SpotifyService;
