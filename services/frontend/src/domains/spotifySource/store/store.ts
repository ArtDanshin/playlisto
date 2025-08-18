import type { StateCreator } from 'zustand';

import { spotifyService } from '@/infrastructure/services/spotify';
import type { SpotifyAuthStatusResponse } from '@/infrastructure/api/spotify';

export interface SpotifyState {
  authStatus: SpotifyAuthStatusResponse;
  isLoading: boolean;
  error: string | null;
  clientId: string;
  login: () => Promise<void>;
  logout: () => void;
  refreshUserProfile: () => Promise<void>;
  initializeSpotify: () => Promise<void>;
  handleSpotifyCallback: () => Promise<void>;
  saveClientId: (clientId: string) => Promise<void>;
}

export const store: StateCreator<SpotifyState> = (set, get) => ({
  authStatus: {
    isAuthenticated: false,
    user: null,
    expiresAt: null,
  },
  isLoading: true,
  error: null,
  clientId: spotifyService.getClientId(),

  initializeSpotify: async () => {
    set({ isLoading: true, error: null });
    try {
      // Проверяем статус авторизации
      const status = spotifyService.getAuthStatus();
      set({ authStatus: status });

      // Если токен истек, пытаемся обновить его
      if (status.isAuthenticated && status.expiresAt && Date.now() >= status.expiresAt - 60000) {
        const refreshed = await spotifyService.refreshToken();
        if (refreshed) {
          const newStatus = spotifyService.getAuthStatus();
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
    } catch (error: any) {
      set({ error: error.message || 'Failed to initialize Spotify' });
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
        const success = await spotifyService.handleCallback();
        if (success) {
          const newStatus = spotifyService.getAuthStatus();
          set({ authStatus: newStatus });
          // Очищаем URL параметры
          window.history.replaceState({}, document.title, window.location.pathname);
        } else {
          set({ error: 'Failed to complete Spotify authorization' });
        }
      } catch (error_: any) {
        set({ error: error_.message || 'Failed to complete Spotify authorization' });
      } finally {
        set({ isLoading: false });
      }
    }
  },

  login: async () => {
    set({ error: null });

    // Проверяем наличие Client ID
    const { clientId } = get();
    if (!clientId.trim()) {
      set({ error: 'Spotify Client ID не настроен. Перейдите в настройки и сохраните Client ID.' });
      return;
    }

    try {
      await spotifyService.initiateAuth();
    } catch (error: any) {
      set({ error: error.message || 'Failed to initiate Spotify login' });
    }
  },

  logout: () => {
    spotifyService.logout();
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
      const user = await spotifyService.fetchUserProfile();
      set((state) => ({
        authStatus: {
          ...state.authStatus,
          user,
        },
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to refresh user profile' });
    }
  },

  saveClientId: async (clientId: string) => {
    set({ error: null });
    try {
      // Сохраняем Client ID через сервис
      spotifyService.setClientId(clientId);

      // Обновляем состояние
      set({ clientId });

      // Если пользователь авторизован, предлагаем переавторизоваться
      const { authStatus } = get();
      if (authStatus.isAuthenticated) {
        spotifyService.logout();
        set({
          authStatus: {
            isAuthenticated: false,
            user: null,
            expiresAt: null,
          },
        });
      }
    } catch (error: any) {
      set({ error: error.message || 'Ошибка сохранения Client ID' });
    }
  },
});
