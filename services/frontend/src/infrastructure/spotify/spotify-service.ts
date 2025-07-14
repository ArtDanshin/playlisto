import type { SpotifyTrackData } from '@/shared/utils/m3u-parser';

import { SPOTIFY_CONFIG, SPOTIFY_STORAGE_KEYS } from './spotify-config';
import {
  generateCodeVerifier, generateCodeChallenge, isTokenExpired, getTokenExpiryTime, getUrlParams,
} from './spotify-utils';

export interface SpotifyUser {
  id: string;
  display_name: string;
  email: string;
  images?: Array<{ url: string; height: number; width: number; }>;
}

export interface SpotifyAuthStatus {
  isAuthenticated: boolean;
  user: SpotifyUser | null;
  expiresAt: number | null;
}

export interface SpotifySearchResponse {
  tracks: {
    href: string;
    items: SpotifyTrackData[];
    limit: number;
    next: string | null;
    offset: number;
    previous: string | null;
    total: number;
  };
}

export class SpotifyService {
  // Инициализация авторизации
  static async initiateAuth(): Promise<void> {
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    // Сохраняем code_verifier для последующего использования
    localStorage.setItem(SPOTIFY_STORAGE_KEYS.CODE_VERIFIER, codeVerifier);

    // Создаем URL для авторизации
    const authUrl = new URL(SPOTIFY_CONFIG.AUTH_URL);
    const params = {
      response_type: 'code',
      client_id: SPOTIFY_CONFIG.CLIENT_ID,
      scope: SPOTIFY_CONFIG.SCOPES,
      code_challenge_method: 'S256',
      code_challenge: codeChallenge,
      redirect_uri: SPOTIFY_CONFIG.REDIRECT_URI,
    };

    authUrl.search = new URLSearchParams(params).toString();
    window.location.href = authUrl.toString();
  }

  // Обработка callback от Spotify
  static async handleCallback(): Promise<boolean> {
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
  private static async exchangeCodeForToken(code: string): Promise<void> {
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
        client_id: SPOTIFY_CONFIG.CLIENT_ID,
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
  static async refreshToken(): Promise<boolean> {
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
          client_id: SPOTIFY_CONFIG.CLIENT_ID,
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
  static async fetchUserProfile(): Promise<SpotifyUser> {
    const response = await this.apiCall('/me');
    const user = response as SpotifyUser;
    localStorage.setItem(SPOTIFY_STORAGE_KEYS.USER_PROFILE, JSON.stringify(user));
    return user;
  }

  // Проверка статуса авторизации
  static getAuthStatus(): SpotifyAuthStatus {
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

    const expiresAtNumber = Number.parseInt(expiresAt);
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
  static logout(): void {
    localStorage.removeItem(SPOTIFY_STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(SPOTIFY_STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(SPOTIFY_STORAGE_KEYS.TOKEN_EXPIRES_AT);
    localStorage.removeItem(SPOTIFY_STORAGE_KEYS.USER_PROFILE);
    localStorage.removeItem(SPOTIFY_STORAGE_KEYS.CODE_VERIFIER);
  }

  // Универсальный метод для API вызовов
  static async apiCall(endpoint: string, options: RequestInit = {}): Promise<any> {
    const accessToken = localStorage.getItem(SPOTIFY_STORAGE_KEYS.ACCESS_TOKEN);
    const expiresAt = localStorage.getItem(SPOTIFY_STORAGE_KEYS.TOKEN_EXPIRES_AT);

    if (!accessToken) {
      throw new Error('No access token available');
    }

    // Проверяем, не истек ли токен
    if (expiresAt && isTokenExpired(Number.parseInt(expiresAt))) {
      const refreshed = await this.refreshToken();
      if (!refreshed) {
        throw new Error('Token expired and refresh failed');
      }
    }

    const currentToken = localStorage.getItem(SPOTIFY_STORAGE_KEYS.ACCESS_TOKEN);
    if (!currentToken) {
      throw new Error('No access token available after refresh');
    }

    const response = await fetch(`${SPOTIFY_CONFIG.API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${currentToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Получение плейлистов пользователя
  static async getUserPlaylists(limit: number = 50, offset: number = 0): Promise<any> {
    return this.apiCall(`/me/playlists?limit=${limit}&offset=${offset}`);
  }

  // Получение конкретного плейлиста
  static async getPlaylist(playlistId: string): Promise<any> {
    return this.apiCall(`/playlists/${playlistId}`);
  }

  // Поиск треков в Spotify
  static async searchTracks(query: string, limit: number = 20): Promise<SpotifySearchResponse> {
    const encodedQuery = encodeURIComponent(query);
    return this.apiCall(`/search?q=${encodedQuery}&type=track&limit=${limit}`);
  }

  // Получение конкретного трека по ID
  static async getTrack(trackId: string): Promise<SpotifyTrackData> {
    return this.apiCall(`/tracks/${trackId}`);
  }
}
