import { create } from 'zustand';

import { spotifyApi } from '@/infrastructure/api/spotify-api';
import type { SpotifyAuthStatus } from '@/infrastructure/spotify/spotify-service';

interface SpotifyState {
  authStatus: SpotifyAuthStatus;
  isLoading: boolean;
  error: string | null;
  login: () => Promise<void>;
  logout: () => void;
  refreshUserProfile: () => Promise<void>;
  initializeSpotify: () => Promise<void>;
  handleSpotifyCallback: () => Promise<void>;
}

export const useSpotifyStore = create<SpotifyState>((set, get) => ({
  authStatus: {
    isAuthenticated: false,
    user: null,
    expiresAt: null,
  },
  isLoading: true,
  error: null,

  initializeSpotify: async () => {
    set({ isLoading: true, error: null });
    try {
      // Проверяем статус авторизации
      const status = spotifyApi.getAuthStatus();
      set({ authStatus: status });

      // Если токен истек, пытаемся обновить его
      if (status.isAuthenticated && status.expiresAt && Date.now() >= status.expiresAt - 60000) {
        const refreshed = await spotifyApi.refreshToken();
        if (refreshed) {
          const newStatus = spotifyApi.getAuthStatus();
          set({ authStatus: newStatus });
        } else {
          // Если не удалось обновить токен, очищаем состояние
          set({
            authStatus: {
              isAuthenticated: false,
              user: null,
              expiresAt: null,
            },
          });
        }
      }
    } catch (err: any) {
      set({ error: err.message || 'Failed to initialize Spotify' });
    } finally {
      set({ isLoading: false });
    }
  },

  handleSpotifyCallback: async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');

    if (error) {
      set({ error: `Spotify authorization error: ${error}` });
      // Очищаем URL параметры
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    if (code) {
      set({ isLoading: true, error: null });
      try {
        const success = await spotifyApi.handleCallback();
        if (success) {
          const newStatus = spotifyApi.getAuthStatus();
          set({ authStatus: newStatus });
          // Очищаем URL параметры
          window.history.replaceState({}, document.title, window.location.pathname);
        } else {
          set({ error: 'Failed to complete Spotify authorization' });
        }
      } catch (err: any) {
        set({ error: err.message || 'Failed to complete Spotify authorization' });
      } finally {
        set({ isLoading: false });
      }
    }
  },

  login: async () => {
    set({ error: null });
    try {
      await spotifyApi.initiateAuth();
    } catch (err: any) {
      set({ error: err.message || 'Failed to initiate Spotify login' });
    }
  },

  logout: () => {
    spotifyApi.logout();
    set({
      authStatus: {
        isAuthenticated: false,
        user: null,
        expiresAt: null,
      },
      error: null,
    });
  },

  refreshUserProfile: async () => {
    const { authStatus } = get();
    if (!authStatus.isAuthenticated) return;

    set({ error: null });
    try {
      const user = await spotifyApi.fetchUserProfile();
      set((state) => ({
        authStatus: {
          ...state.authStatus,
          user,
        },
      }));
    } catch (err: any) {
      set({ error: err.message || 'Failed to refresh user profile' });
    }
  },
}));
