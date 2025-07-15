import { create } from 'zustand';

import type { ParsedPlaylist, Track } from '@/shared/utils/m3u-parser';
import { playlistDB } from '@/infrastructure/storage/indexed-db';

interface PlaylistState {
  currentPlaylist: ParsedPlaylist | null;
  playlists: ParsedPlaylist[];
  isLoading: boolean;
  error: string | null;
  setCurrentPlaylist: (playlist: ParsedPlaylist | null) => void;
  updateCurrentPlaylistTracks: (tracks: Track[]) => void;
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

  setCurrentPlaylist: (playlist) => {
    if (playlist) {
      // Очищаем флаг isNew при переключении на плейлист
      const cleanPlaylist = {
        ...playlist,
        tracks: playlist.tracks.map((track) => ({
          ...track,
          isNew: undefined, // Удаляем флаг isNew
        })),
      };
      set({ currentPlaylist: cleanPlaylist });
    } else {
      set({ currentPlaylist: null });
    }
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
      const playlistId = await playlistDB.addPlaylist(playlist);
      const playlistWithId = { ...playlist, id: playlistId };
      set((state) => {
        const existingIndex = state.playlists.findIndex((p) => p.name === playlist.name);
        let playlists;
        if (existingIndex === -1) {
          playlists = [...state.playlists, playlistWithId];
        } else {
          playlists = [...state.playlists];
          playlists[existingIndex] = playlistWithId;
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
      // Сохраняем плейлист с флагом isNew для отображения
      await playlistDB.updatePlaylist(playlist);
      set((state) => {
        const playlists = state.playlists.map((p) => p.id === playlist.id ? playlist : p);
        // Убираем обновление currentPlaylist из updatePlaylist
        return { playlists };
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

      // Очищаем флаг isNew при загрузке из базы данных
      const cleanPlaylists = savedPlaylists.map((playlist) => ({
        ...playlist,
        tracks: playlist.tracks.map((track) => ({
          ...track,
          isNew: undefined, // Удаляем флаг isNew при загрузке
        })),
      }));

      set({ playlists: cleanPlaylists });
    } catch (error: any) {
      set({ error: error.message || 'Failed to load playlists' });
    } finally {
      set({ isLoading: false });
    }
  },
}));
