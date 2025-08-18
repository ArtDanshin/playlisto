import { SPOTIFY_CONFIG, SPOTIFY_STORAGE_KEYS } from '@/infrastructure/configs/spotify';
import {
  generateCodeVerifier, generateCodeChallenge, isTokenExpired, getTokenExpiryTime, getUrlParams,
} from '@/shared/utils/spotify';

import type {
  SpotifyTrackDataResponse, SpotifyUserResponse, SpotifyAuthStatusResponse, SpotifySearchResponse, SpotifyPlaylistInfoResponse, SpotifyPlaylistTracksResponse,
} from './types';

interface SpotifyApiClient {
  initiateAuth: () => Promise<void>;
  handleCallback: () => Promise<boolean>;
  refreshToken: () => Promise<boolean>;
  fetchUserProfile: () => Promise<SpotifyUserResponse>;
  getAuthStatus: () => SpotifyAuthStatusResponse;
  logout: () => void;
  apiCall: (endpoint: string, options?: RequestInit) => Promise<any>;
  getPlaylistInfo: (playlistId: string) => Promise<SpotifyPlaylistInfoResponse>;
  getPlaylistTracks: (playlistId: string, limit?: number, offset?: number) => Promise<SpotifyPlaylistTracksResponse>;
  searchTracks: (query: string, limit?: number) => Promise<SpotifySearchResponse>;
  getTrack: (trackId: string) => Promise<SpotifyTrackDataResponse>;
  createPlaylist: (name: string, description?: string) => Promise<SpotifyPlaylistInfoResponse>;
  updatePlaylistTracks: (playlistId: string, trackUris: string[]) => Promise<void>;
  getClientId: () => string;
  hasClientId: () => boolean;
}

class SpotifyApi implements SpotifyApiClient {
  // Получение Client ID из localStorage
  getClientId(): string {
    const localClientId = localStorage.getItem(SPOTIFY_STORAGE_KEYS.CLIENT_ID);
    return localClientId && localClientId.trim() ? localClientId : '';
  }

  // Проверка наличия Client ID
  hasClientId(): boolean {
    return !!this.getClientId();
  }

  // Инициализация авторизации
  async initiateAuth(): Promise<void> {
    // Проверяем наличие Client ID
    if (!this.hasClientId()) {
      throw new Error('Spotify Client ID не настроен. Перейдите в настройки и сохраните Client ID.');
    }

    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    // Сохраняем code_verifier для последующего использования
    localStorage.setItem(SPOTIFY_STORAGE_KEYS.CODE_VERIFIER, codeVerifier);

    // Создаем URL для авторизации
    const authUrl = new URL(SPOTIFY_CONFIG.AUTH_URL);
    const params = {
      response_type: 'code',
      client_id: this.getClientId(),
      scope: SPOTIFY_CONFIG.SCOPES,
      code_challenge_method: 'S256',
      code_challenge: codeChallenge,
      redirect_uri: SPOTIFY_CONFIG.REDIRECT_URI,
    };

    authUrl.search = new URLSearchParams(params).toString();
    window.location.href = authUrl.toString();
  }

  // Обработка callback от Spotify
  async handleCallback(): Promise<boolean> {
    const urlParams = getUrlParams();
    const code = urlParams.get('code');
    const error = urlParams.get('error');

    if (error) {
      console.error('Spotify auth error:', error);
      return false;
    }

    if (!code) {
      return false;
    }

    try {
      await this.exchangeCodeForToken(code);
      await this.fetchUserProfile();
      return true;
    } catch (error) {
      console.error('Failed to complete Spotify auth:', error);
      return false;
    }
  }

  // Обмен кода авторизации на токен
  private async exchangeCodeForToken(code: string): Promise<void> {
    const codeVerifier = localStorage.getItem(SPOTIFY_STORAGE_KEYS.CODE_VERIFIER);
    if (!codeVerifier) {
      throw new Error('Code verifier not found');
    }

    const response = await fetch(SPOTIFY_CONFIG.TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: this.getClientId(),
        grant_type: 'authorization_code',
        code,
        redirect_uri: SPOTIFY_CONFIG.REDIRECT_URI,
        code_verifier: codeVerifier,
      }),
    });

    if (!response.ok) {
      throw new Error(`Token exchange failed: ${response.status}`);
    }

    const data = await response.json();

    // Сохраняем токены
    localStorage.setItem(SPOTIFY_STORAGE_KEYS.ACCESS_TOKEN, data.access_token);
    localStorage.setItem(SPOTIFY_STORAGE_KEYS.REFRESH_TOKEN, data.refresh_token);
    localStorage.setItem(SPOTIFY_STORAGE_KEYS.TOKEN_EXPIRES_AT, getTokenExpiryTime(data.expires_in).toString());

    // Очищаем code_verifier
    localStorage.removeItem(SPOTIFY_STORAGE_KEYS.CODE_VERIFIER);
  }

  // Обновление токена
  async refreshToken(): Promise<boolean> {
    const refreshToken = localStorage.getItem(SPOTIFY_STORAGE_KEYS.REFRESH_TOKEN);
    if (!refreshToken) {
      return false;
    }

    try {
      const response = await fetch(SPOTIFY_CONFIG.TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.getClientId(),
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
        }),
      });

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.status}`);
      }

      const data = await response.json();

      localStorage.setItem(SPOTIFY_STORAGE_KEYS.ACCESS_TOKEN, data.access_token);
      if (data.refresh_token) {
        localStorage.setItem(SPOTIFY_STORAGE_KEYS.REFRESH_TOKEN, data.refresh_token);
      }
      localStorage.setItem(SPOTIFY_STORAGE_KEYS.TOKEN_EXPIRES_AT, getTokenExpiryTime(data.expires_in).toString());

      return true;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      return false;
    }
  }

  // Получение профиля пользователя
  async fetchUserProfile(): Promise<SpotifyUserResponse> {
    const response = await this.apiCall('/me');
    const user = response as SpotifyUserResponse;
    localStorage.setItem(SPOTIFY_STORAGE_KEYS.USER_PROFILE, JSON.stringify(user));
    return user;
  }

  // Проверка статуса авторизации
  getAuthStatus(): SpotifyAuthStatusResponse {
    const accessToken = localStorage.getItem(SPOTIFY_STORAGE_KEYS.ACCESS_TOKEN);
    const expiresAt = localStorage.getItem(SPOTIFY_STORAGE_KEYS.TOKEN_EXPIRES_AT);
    const userProfile = localStorage.getItem(SPOTIFY_STORAGE_KEYS.USER_PROFILE);

    if (!accessToken || !expiresAt) {
      return {
        isAuthenticated: false,
        user: null,
        expiresAt: null,
      };
    }

    const expiresAtNumber = Number.parseInt(expiresAt, 10);
    if (isTokenExpired(expiresAtNumber)) {
      return {
        isAuthenticated: false,
        user: null,
        expiresAt: null,
      };
    }

    return {
      isAuthenticated: true,
      user: userProfile ? JSON.parse(userProfile) : null,
      expiresAt: expiresAtNumber,
    };
  }

  // Выход из аккаунта
  logout(): void {
    localStorage.removeItem(SPOTIFY_STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(SPOTIFY_STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(SPOTIFY_STORAGE_KEYS.TOKEN_EXPIRES_AT);
    localStorage.removeItem(SPOTIFY_STORAGE_KEYS.USER_PROFILE);
    localStorage.removeItem(SPOTIFY_STORAGE_KEYS.CODE_VERIFIER);
  }

  // Универсальный метод для API вызовов
  async apiCall(endpoint: string, options: RequestInit = {}): Promise<any> {
    const accessToken = localStorage.getItem(SPOTIFY_STORAGE_KEYS.ACCESS_TOKEN);
    if (!accessToken) {
      throw new Error('No access token available');
    }

    const response = await fetch(`${SPOTIFY_CONFIG.API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Токен истек, пытаемся обновить
        const refreshed = await this.refreshToken();
        if (refreshed) {
          // Повторяем запрос с новым токеном
          return this.apiCall(endpoint, options);
        }

        throw new Error('Authentication failed');
      }
      throw new Error(`API call failed: ${response.status}`);
    }

    return response.json();
  }

  // Получение конкретного плейлиста
  async getPlaylistInfo(playlistId: string): Promise<SpotifyPlaylistInfoResponse> {
    // Запрашиваем только основную информацию о плейлисте
    const fields = [
      'name',
      'id',
      'owner',
    ].join(',');

    return this.apiCall(`/playlists/${playlistId}?fields=${encodeURIComponent(fields)}`);
  }

  // Получение треков плейлиста с поддержкой пагинации
  async getPlaylistTracks(playlistId: string, offset: number = 0, limit: number = 50): Promise<SpotifyPlaylistTracksResponse> {
    // Запрашиваем только необходимые поля для оптимизации размера ответа
    const fields = [
      'items(track(id,name,artists(id,name),album(id,name,images),duration_ms))',
      'total',
      'limit',
      'offset',
      'external_urls',
      'uri',
    ].join(',');

    return this.apiCall(`/playlists/${playlistId}/tracks?limit=${limit}&offset=${offset}&fields=${encodeURIComponent(fields)}`);
  }

  // Поиск треков
  async searchTracks(query: string, limit: number = 20): Promise<SpotifySearchResponse> {
    const response = await this.apiCall(`/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`);
    return response as SpotifySearchResponse;
  }

  // Получение информации о треке
  async getTrack(trackId: string): Promise<SpotifyTrackDataResponse> {
    const response = await this.apiCall(`/tracks/${trackId}`);
    return response as SpotifyTrackDataResponse;
  }

  // Создание плейлиста
  async createPlaylist(name: string, description?: string): Promise<SpotifyPlaylistInfoResponse> {
    const response = await this.apiCall('/me/playlists', {
      method: 'POST',
      body: JSON.stringify({
        name,
        description: description || `Экспортировано из Playlisto - ${new Date().toLocaleDateString()}`,
        public: false,
      }),
    });

    return response as SpotifyPlaylistInfoResponse;
  }

  // Обновление информации о треках плейлиста
  async updatePlaylistTracks(playlistId: string, trackUris: string[]): Promise<void> {
    await this.apiCall(`/playlists/${playlistId}/tracks`, {
      method: 'PUT',
      body: JSON.stringify({
        uris: trackUris,
      }),
    });

    return;
  }
}

// Создаем глобальный экземпляр API клиента
export const spotifyApi = new SpotifyApi();

// Экспортируем типы
export * from './types';
