import { playlistoDB } from '@/infrastructure/storage/playlisto-db';
import type { Playlist as PlaylistAPI } from '@/infrastructure/storage/playlisto-db';
import { getTrackExternalServices, createCoverKey } from '@/shared/utils/playlist';

import type { PlaylistoDBService as PlaylistoDBServiceImp, Playlist, Track } from './types';

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
}

// Создаем глобальный экземпляр базы данных
export const service = PlaylistoDBService;
