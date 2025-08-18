import type { StateCreator } from 'zustand';

import type { SpotifyState } from './store';

export const store: StateCreator<SpotifyState> = (set) => ({
  authStatus: {
    isAuthenticated: false,
    user: null,
    expiresAt: null,
  },
  isLoading: false,
  error: null,
  clientId: 'mock_client_id',

  initializeSpotify: async () => {
    set({
      authStatus: {
        isAuthenticated: true,
        user: {
          id: 'coolMeloman',
          display_name: 'CoolMeloman',
          email: 'cool-meloman@playlisto.local',
        },
        expiresAt: new Date(8.64e15).getTime(),
      },
    });
  },

  handleSpotifyCallback: async () => {
    set({
      authStatus: {
        isAuthenticated: true,
        user: {
          id: 'coolMeloman',
          display_name: 'CoolMeloman',
          email: 'cool-meloman@playlisto.local',
        },
        expiresAt: new Date(8.64e15).getTime(),
      },
    });
  },

  login: async () => {
    set({
      authStatus: {
        isAuthenticated: true,
        user: {
          id: 'coolMeloman',
          display_name: 'CoolMeloman',
          email: 'cool-meloman@playlisto.local',
        },
        expiresAt: new Date(8.64e15).getTime(),
      },
    });
  },

  logout: () => {
    set({
      authStatus: {
        isAuthenticated: false,
        user: null,
        expiresAt: null,
      },
      error: null,
    });
  },

  refreshUserProfile: async () => {},
  saveClientId: async () => {},
});
