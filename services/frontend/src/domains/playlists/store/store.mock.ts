import type { StateCreator } from 'zustand';

import type { PlaylistState } from './store';

export const store: StateCreator<PlaylistState> = () => ({
  currentPlaylist: null,
  playlists: [],
  isLoading: true,
  error: null,
  newTracks: new Set<string>(),

  setCurrentPlaylist: () => {},
  updateCurrentPlaylistTracks: async () => {},
  mergeCurrentPlaylistTracks: async () => {},
  addPlaylist: async () => {},
  removePlaylist: async () => {},
  updatePlaylist: async () => {},
  loadPlaylists: async () => {},
  updatePlaylistsOrder: async () => {},
  setNewTracks: () => {},
  clearNewTracks: () => {},
});
