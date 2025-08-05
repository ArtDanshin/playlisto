import type { StateCreator } from 'zustand';

import type { Playlist, Track } from '@/shared/types/playlist';
import { playlistoDBService } from '@/infrastructure/services/playlisto-db';
import { createTrackKey, type MergeTracksOptions, mergeTracks } from '@/shared/utils/playlist';

export interface PlaylistState {
  currentPlaylist: Playlist | null;
  playlists: Playlist[];
  isLoading: boolean;
  error: string | null;
  newTracks: Set<string>;
  setCurrentPlaylist: (playlist: Playlist | null) => void;
  loadPlaylists: () => Promise<void>;
  addPlaylist: (playlist: Playlist) => Promise<void>;
  removePlaylist: (playlistId: Playlist) => Promise<void>;
  updatePlaylist: (playlist: Playlist) => Promise<void>;
  updatePlaylistTracksOrder: (playlist: Playlist) => Promise<void>;
  updatePlaylistWithCoverLoad: (playlist: Playlist) => Promise<void>;
  mergeCurrentPlaylistTracks: (tracks: Track[], mergeOptions: MergeTracksOptions) => Promise<void>;
  updatePlaylistsOrder: (orderedPlaylists: Playlist[]) => Promise<void>;
  setNewTracks: (tracks: Track[]) => void;
}

export const store: StateCreator<PlaylistState> = (set, get) => ({
  currentPlaylist: null,
  playlists: [],
  isLoading: true,
  error: null,
  newTracks: new Set<string>(),
  
  setCurrentPlaylist: (playlist) => {
    set({ currentPlaylist: playlist, newTracks: new Set() });
  },
  
  loadPlaylists: async () => {
    set({ isLoading: true, error: null });
    try {
      await playlistoDBService.init();
      const savedPlaylists = await playlistoDBService.getAllPlaylists();
  
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

  removePlaylist: async (playlist: Playlist) => {
    set({ isLoading: true, error: null });
    try {
      await playlistoDBService.deletePlaylist(playlist);

      set((state) => {
        // Удаляем плейлист из списка плейлистов
        const playlists = state.playlists.filter((p) => p.id !== playlist.id);
        // Обнуляем активный плейлист, если это был удаленный
        const currentPlaylist = state.currentPlaylist?.id === playlist.id ? null : state.currentPlaylist;

        return { playlists, currentPlaylist };
      });
    } catch (error: any) {
      set({ error: error.message || 'Failed to remove playlist' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updatePlaylist: async (playlist: Playlist) => {
    try {
      await playlistoDBService.updatePlaylist(playlist);
      set((state) => {
        // Обновляем плейлист в списке плейлистов
        const playlists = state.playlists.map((p) => p.id === playlist.id ? playlist : p);
        // Обновляем активный плейлист, если он изменился он
        const currentPlaylist = state.currentPlaylist?.id === playlist.id ? playlist : state.currentPlaylist;
        
        return { playlists, currentPlaylist };
      });
    } catch (error: any) {
      set({ error: error.message || 'Failed to update playlist' });
      throw error;
    }
  },

  updatePlaylistTracksOrder: async (playlist: Playlist) => {
    const { updatePlaylist } = get();

    // Выставляем всем трекам новые позиции в соответствии с индексами массива
    const updatedTracks = playlist.tracks.map((track, index) => ({
      ...track,
      position: index + 1,
    }));

    const updatedPlaylist = {
      ...playlist,
      tracks: updatedTracks,
    };

    await updatePlaylist(updatedPlaylist);

    return;
  },

  updatePlaylistWithCoverLoad: async (playlist: Playlist) => {
    try {
      const newPlaylist = await playlistoDBService.updatePlaylistWithCoverLoad(playlist);

      set((state) => {
        // Обновляем плейлист в списке плейлистов
        const playlists = state.playlists.map((p) => p.id === newPlaylist.id ? newPlaylist : p);
        // Обновляем активный плейлист, если он изменился он
        const currentPlaylist = state.currentPlaylist?.id === newPlaylist.id ? newPlaylist : state.currentPlaylist;

        return { playlists, currentPlaylist };
      });
    } catch (error: any) {
      set({ error: error.message || 'Failed to update playlist' });
      throw error;
    }
  },

  mergeCurrentPlaylistTracks: async (tracks: Track[], mergeOptions: MergeTracksOptions) => {
    const { currentPlaylist, setNewTracks } = get();
    try {
      if (!currentPlaylist) {
        set({ error: 'Ошибка при обновлении состава списка треков: Не выбран плейлист' });
        return;
      }

      const { mergedTracks, newTracks } = mergeTracks(currentPlaylist.tracks, tracks, mergeOptions);
      const resultPlaylist = await playlistoDBService.updatePlaylistWithCoverLoad({ ...currentPlaylist, tracks: mergedTracks });

      set({ currentPlaylist: resultPlaylist });
      setNewTracks(newTracks);
    } catch (error: any) {
      set({ error: error.message || 'Failed to update playlist' });
      throw error;
    }
  },

  updatePlaylistsOrder: async (orderedPlaylists: Playlist[]) => {
    // Выставляем всем плейлистам новые позиции в соответствии с индексами массива
    const updatedPlaylists = orderedPlaylists.map((playlist, index) => ({
      ...playlist,
      position: index + 1,
    }));

    set({ playlists: updatedPlaylists });
    // Сохраняем порядок в IndexedDB
    await Promise.all(updatedPlaylists.map(playlistoDBService.updatePlaylist));
  },

  setNewTracks: (tracks: Track[]) => {
    set({ newTracks: new Set(tracks.map(createTrackKey)) });
  },
});
