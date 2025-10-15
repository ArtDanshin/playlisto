import type { StateCreator } from 'zustand';

import type { PlaylistState } from './store';

export const store: StateCreator<PlaylistState> = () => ({
  currentPlaylist: null,
  playlists: [],
  isLoading: true,
  error: null,
  newTracks: new Set<string>(),

  setCurrentPlaylist: () => {},
  loadPlaylists: async () => {},
  loadPlaylist: async () => {},
  addPlaylist: async () => {},
  removePlaylist: async () => {},
  updatePlaylist: async () => {},
  updatePlaylistTracksOrder: async () => {},
  updatePlaylistWithCoverLoad: async () => {},
  updatePlaylistInfo: async () => ({ id: 1, name: 'Test', order: 0, tracks: [] }),
  mergeCurrentPlaylistTracks: async () => {},
  updatePlaylistsOrder: async () => {},
  setNewTracks: () => {},
  clearNewTracks: () => {},
});
