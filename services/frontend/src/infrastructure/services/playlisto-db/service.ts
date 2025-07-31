import { playlistoDB } from '@/infrastructure/storage/playlisto-db';
import type { Playlist as PlaylistAPI } from '@/infrastructure/storage/playlisto-db';
import { getTrackExternalServices, createCoverKey, getMatchKeyBySource as getMatchKeyBySource } from '@/shared/utils/playlist';

import type { PlaylistoDBService as PlaylistoDBServiceImp, Playlist, Track, MergeOptions } from './types';

class PlaylistoDBService implements PlaylistoDBServiceImp {
  async init(): Promise<void> {
    return playlistoDB.init();
  }

  async addCoverByURL(url: string, key?: string): Promise<string> {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const reader = new FileReader();

      return new Promise((resolve) => {
        reader.onloadend = async () => {
          const base64 = reader.result as string;
          const coverKey = key || url;
          await playlistoDB.addCover(coverKey, base64);
          resolve(coverKey);
        };
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Failed to save cover:', error);
      throw new Error(`Ошибка при загрузке обложки. URL: ${url}`);
    }
  }

  async createPlaylist(playlist: Playlist): Promise<void> {
    const resultPlaylist: PlaylistAPI = {
      name: playlist.name, 
      order: playlist.order,
      tracks: [],
    }

    if (playlist.order === 0) {
      resultPlaylist.order = await playlistoDB.getPlaylistsCount();
    }

    for (const track of playlist.tracks) {
      const resultTrack = { ...track };

      if (!track.coverKey) {
        const service = getTrackExternalServices(track)[0];
        
        if (!service || !track[`${service}Data`]?.coverUrl) {
          resultPlaylist.tracks.push(resultTrack);
          continue;
        }
        
        const coverKey = createCoverKey(service, track[`${service}Data`].coverUrl);
        
        try {
          await this.addCoverByURL(track[`${service}Data`].coverUrl, coverKey);

          resultTrack.coverKey = coverKey;
        } catch (error) {
          console.log(error);
          console.error(`Треку ${track.artist} - ${track.title} не добавлена обложка`);
        }
      }
      
      resultPlaylist.tracks.push(resultTrack);
    }

    await playlistoDB.addPlaylist(resultPlaylist);
  }

  async updatePlaylistWithCoverLoad(playlist: Playlist): Promise<Playlist> {
    const resultPlaylist: PlaylistAPI = {
      ...playlist,
      tracks: [],
    }

    for (const track of playlist.tracks) {
      const resultTrack = { ...track };

      if (!track.coverKey) {
        const service = getTrackExternalServices(track)[0];
        
        if (!service || !track[`${service}Data`]?.coverUrl) {
          resultPlaylist.tracks.push(resultTrack);
          continue;
        }
        
        const coverKey = createCoverKey(service, track[`${service}Data`].coverUrl);
        
        try {
          await this.addCoverByURL(track[`${service}Data`].coverUrl, coverKey);

          resultTrack.coverKey = coverKey;
        } catch (error) {
          console.log(error);
          console.error(`Треку ${track.artist} - ${track.title} не добавлена обложка`);
        }
      }
      
      resultPlaylist.tracks.push(resultTrack);
    }

    await playlistoDB.updatePlaylist(resultPlaylist);

    return resultPlaylist;
  }

  // TODO: поправить логику склеивания данный треков, на более универсальную
  async mergePlaylistTracks(
    playlist: Playlist,
    mergeTracks: Track[],
    mergeOptions: MergeOptions
  ): Promise<{ playlist: Playlist, newTracks: Track[] }> {
    const existingTracks = [...playlist.tracks];
    const uploadedTracks = [...mergeTracks];

    // Создаем Map для быстрого поиска треков по ключу
    const existingTracksMap = new Map<string, Track>();
    const uploadedTracksMap = new Map<string, Track>();

    existingTracks.forEach((track) => {
      const trackKey = getMatchKeyBySource(track, mergeOptions.source);
      existingTracksMap.set(trackKey, track);
    });

    uploadedTracks.forEach((track) => {
      const trackKey = getMatchKeyBySource(track, mergeOptions.source);
      uploadedTracksMap.set(trackKey, track);
    });

    let mergedTracks: Track[] = [];
    let newTracks: Track[] = [];

    if (mergeOptions.syncOrder) {
      // Синхронизируем порядок как в загруженном плейлисте
      mergedTracks = uploadedTracks.map((uploadedTrack, index) => {
        const trackKey = getMatchKeyBySource(uploadedTrack, mergeOptions.source);
        const existingTrack = existingTracksMap.get(trackKey);
        if (existingTrack) {
          // Сохраняем существующие данные (Spotify, обложки и т.д.)
          return {
            ...uploadedTrack,
            position: index + 1,
            spotifyData: existingTrack.spotifyData,
            coverKey: existingTrack.coverKey,
            album: existingTrack.album,
            m3uData: existingTrack.m3uData,
          };
        }
        // Новый трек
        return {
          ...uploadedTrack,
          position: index + 1,
        };
      });

      // Добавляем треки, которых нет в загруженном плейлисте, в конец
      if (mergeOptions.addNewTracks) {
        const missingTracks = existingTracks.filter((existingTrack) => {
          const trackKey = getMatchKeyBySource(existingTrack, mergeOptions.source);
          return !uploadedTracksMap.has(trackKey);
        });
        const missingTracksWithUpdatedPositions = missingTracks.map((track, index) => ({
          ...track,
          position: mergedTracks.length + index + 1,
        }));
        mergedTracks.push(...missingTracksWithUpdatedPositions);
        newTracks.push(...missingTracksWithUpdatedPositions);
      }
    } else {
      // Простое объединение без изменения порядка
      mergedTracks = [...existingTracks];

      if (mergeOptions.addNewTracks) {
        // Добавляем новые треки в конец
        uploadedTracks.forEach((uploadedTrack) => {
          const trackKey = getMatchKeyBySource(uploadedTrack, mergeOptions.source);
          if (existingTracksMap.has(trackKey)) {
            // Обновляем существующий трек данными из загруженного источника
            const existingTrackIndex = mergedTracks.findIndex((t) => getMatchKeyBySource(t, mergeOptions.source) === trackKey);
            if (existingTrackIndex !== -1) {
              const existingTrack = mergedTracks[existingTrackIndex];
              mergedTracks[existingTrackIndex] = {
                ...existingTrack,
                ...uploadedTrack,
                // Сохраняем данные внешних сервисов
                spotifyData: existingTrack.spotifyData || uploadedTrack.spotifyData,
                m3uData: existingTrack.m3uData || uploadedTrack.m3uData,
                coverKey: existingTrack.coverKey || uploadedTrack.coverKey,
              };
            }
          } else {
            const newTrack = {
              ...uploadedTrack,
              position: mergedTracks.length + 1,
            };
            mergedTracks.push(newTrack);
            newTracks.push(newTrack);
          }
        });
      }
    }

    if (mergeOptions.removeMissingTracks) {
      // Удаляем треки, которых нет в загруженном плейлисте
      mergedTracks = mergedTracks.filter((track) => {
        const trackKey = getMatchKeyBySource(track, mergeOptions.source);
        return uploadedTracksMap.has(trackKey);
      });
    }

    const resultPlaylist = await this.updatePlaylistWithCoverLoad({ ...playlist, tracks: mergedTracks })

    return {
      playlist: resultPlaylist,
      newTracks,
    }
  }
}

// Создаем глобальный экземпляр базы данных
export const service = PlaylistoDBService;
