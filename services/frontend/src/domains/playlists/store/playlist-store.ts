import { create } from 'zustand';

import type { Playlist, Track } from '@/shared/types';
import { playlistoDB } from '@/infrastructure/storage/playlisto-db';
import { playlistoDBService } from '@/infrastructure/services/playlisto-db';

interface PlaylistState {
  currentPlaylist: Playlist | null;
  playlists: Playlist[];
  isLoading: boolean;
  error: string | null;
  newTracks: Set<string>; // Set of track keys for new tracks
  setCurrentPlaylist: (playlist: Playlist | null) => void;
  updateCurrentPlaylistTracks: (tracks: Track[]) => void;
  addPlaylist: (playlist: Playlist) => Promise<void>;
  removePlaylist: (playlistId: number) => Promise<void>;
  updatePlaylist: (playlist: Playlist) => Promise<void>;
  loadPlaylists: () => Promise<void>;
  updatePlaylistsOrder: (orderedIds: number[]) => Promise<void>;
  setNewTracks: (trackKeys: string[]) => void;
  clearNewTracks: () => void;
}

export const usePlaylistStore = create<PlaylistState>((set, get) => ({
  currentPlaylist: null,
  playlists: [],
  isLoading: true,
  error: null,
  newTracks: new Set<string>(),

  setCurrentPlaylist: (playlist) => {
    set({ currentPlaylist: playlist, newTracks: new Set() });
  },

  updateCurrentPlaylistTracks: (tracks) => {
    set((state) => ({
      currentPlaylist: state.currentPlaylist
        ? {
            ...state.currentPlaylist,
            tracks,
          }
        : null,
    }));
  },

  addPlaylist: async (playlist) => {
    set({ isLoading: true, error: null });
    try {
      const { playlists, loadPlaylists } = get();
      // Устанавливаем order для нового плейлиста (в конец списка)
      const newOrder = playlists.length;
      const playlistWithOrder = { ...playlist, order: newOrder };

      await playlistoDBService.createPlaylist(playlistWithOrder);
      await loadPlaylists();
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
      await playlistoDB.deletePlaylist(playlistId);
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
      await playlistoDB.updatePlaylist(playlist);
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
      await playlistoDB.init();
      const savedPlaylists = await playlistoDB.getAllPlaylists();

      // Сортируем по полю order
      const sortedPlaylists = savedPlaylists
        .sort((a, b) => {
          const orderA = a.order ?? Number.MAX_SAFE_INTEGER;
          const orderB = b.order ?? Number.MAX_SAFE_INTEGER;
          return orderA - orderB;
        });

      set({ playlists: sortedPlaylists });
    } catch (error: any) {
      set({ error: error.message || 'Failed to load playlists' });
    } finally {
      set({ isLoading: false });
    }
  },

  updatePlaylistsOrder: async (orderedIds) => {
    const { playlists } = get();
    // Переставляем элементы в новом порядке и обновляем order
    const ordered = orderedIds
      .map((id, idx) => {
        const p = playlists.find((pl) => pl.id === id);
        return p ? { ...p, order: idx } : undefined;
      })
      .filter(Boolean) as Playlist[];
    set({ playlists: ordered });
    // Сохраняем порядок в IndexedDB
    await Promise.all(ordered.map((p) => p.id === undefined ? undefined : playlistoDB.updatePlaylist(p)));
  },

  setNewTracks: (trackKeys) => {
    set({ newTracks: new Set(trackKeys) });
  },

  clearNewTracks: () => {
    set({ newTracks: new Set() });
  },
}));
