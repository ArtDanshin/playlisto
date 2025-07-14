import { create } from 'zustand';

import type { ParsedPlaylist } from '@/shared/utils/m3u-parser';
import { playlistDB } from '@/infrastructure/storage/indexed-db';

interface PlaylistState {
  currentPlaylist: ParsedPlaylist | null;
  playlists: ParsedPlaylist[];
  isLoading: boolean;
  error: string | null;
  setCurrentPlaylist: (playlist: ParsedPlaylist | null) => void;
  addPlaylist: (playlist: ParsedPlaylist) => Promise<void>;
  removePlaylist: (playlistId: number) => Promise<void>;
  updatePlaylist: (playlist: ParsedPlaylist) => Promise<void>;
  loadPlaylists: () => Promise<void>;
}

export const usePlaylistStore = create<PlaylistState>((set) => ({
  currentPlaylist: null,
  playlists: [],
  isLoading: true,
  error: null,

  setCurrentPlaylist: (playlist) => set({ currentPlaylist: playlist }),

  addPlaylist: async (playlist) => {
    set({ isLoading: true, error: null });
    try {
      const playlistId = await playlistDB.addPlaylist(playlist);
      const playlistWithId = { ...playlist, id: playlistId };
      set((state) => {
        const existingIndex = state.playlists.findIndex((p) => p.name === playlist.name);
        let playlists;
        if (existingIndex !== -1) {
          playlists = [...state.playlists];
          playlists[existingIndex] = playlistWithId;
        } else {
          playlists = [...state.playlists, playlistWithId];
        }
        return { playlists, currentPlaylist: playlistWithId };
      });
    } catch (error: any) {
      set({ error: error.message || 'Failed to add playlist' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  removePlaylist: async (playlistId) => {
    set({ isLoading: true, error: null });
    try {
      await playlistDB.deletePlaylist(playlistId);
      set((state) => {
        const playlists = state.playlists.filter((p) => p.id !== playlistId);
        const currentPlaylist = state.currentPlaylist?.id === playlistId ? null : state.currentPlaylist;
        return { playlists, currentPlaylist };
      });
    } catch (error: any) {
      set({ error: error.message || 'Failed to remove playlist' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updatePlaylist: async (playlist) => {
    set({ isLoading: true, error: null });
    try {
      await playlistDB.updatePlaylist(playlist);
      set((state) => {
        const playlists = state.playlists.map((p) => p.id === playlist.id ? playlist : p);
        const currentPlaylist = state.currentPlaylist?.id === playlist.id ? playlist : state.currentPlaylist;
        return { playlists, currentPlaylist };
      });
    } catch (error: any) {
      set({ error: error.message || 'Failed to update playlist' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  loadPlaylists: async () => {
    set({ isLoading: true, error: null });
    try {
      await playlistDB.init();
      const savedPlaylists = await playlistDB.getAllPlaylists();
      set({ playlists: savedPlaylists });
    } catch (error: any) {
      set({ error: error.message || 'Failed to load playlists' });
    } finally {
      set({ isLoading: false });
    }
  },
}));
