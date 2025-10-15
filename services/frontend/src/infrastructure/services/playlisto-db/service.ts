import { playlistoDB } from '@/infrastructure/storage/playlisto-db';
import type { CoverData, Playlist as PlaylistAPI } from '@/infrastructure/storage/playlisto-db';
import { getTrackExternalServices, createCoverKey } from '@/shared/utils/playlist';
import type { Playlist } from '@/shared/types/playlist';

import type { PlaylistoDBService as PlaylistoDBServiceImp, DatabaseDump } from './types';

class PlaylistoDBService implements PlaylistoDBServiceImp {
  async init(): Promise<void> {
    return await playlistoDB.init();
  }

  async getAllPlaylists(): Promise<Playlist[]> {
    return await playlistoDB.getAllPlaylists();
  }

  async getPlaylistById(id: number): Promise<Playlist | undefined> {
    return await playlistoDB.getPlaylistById(id);
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

  async addCoverByBase64(base64: string, key: string): Promise<void> {
    return await playlistoDB.addCover(key, base64);
  }

  async createPlaylist(playlist: Playlist): Promise<void> {
    const resultPlaylist: PlaylistAPI = {
      name: playlist.name,
      description: playlist.description,
      order: playlist.order,
      tracks: [],
      spotifyData: playlist.spotifyData,
    };

    if (playlist.order === 0) {
      resultPlaylist.order = await playlistoDB.getPlaylistsCount();
    }

    // Обрабатываем обложку плейлиста
    if (playlist.coverKey) {
      resultPlaylist.coverKey = playlist.coverKey;
    } else if (playlist.spotifyData?.coverUrl) {
      const coverKey = `playlist_spotify_${playlist.spotifyData.id}`;
      try {
        await this.addCoverByURL(playlist.spotifyData.coverUrl, coverKey);
        resultPlaylist.coverKey = coverKey;
      } catch (error) {
        console.error('Ошибка при загрузке обложки плейлиста:', error);
      }
    }

    for (const track of playlist.tracks) {
      const resultTrack = { ...track };

      if (!track.coverKey) {
        const service = getTrackExternalServices(track)[0];

        if (!service || !track[`${service}Data`]?.coverUrl) {
          resultPlaylist.tracks.push(resultTrack);
          continue;
        }

        const coverKey = createCoverKey(service, track[`${service}Data`]!.coverUrl);

        try {
          await this.addCoverByURL(track[`${service}Data`]!.coverUrl, coverKey);

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

  async deletePlaylist(playlist: Playlist): Promise<void> {
    if (!playlist.id) {
      throw new Error('У плейлиста отсутствует ID');
    }

    await playlistoDB.deletePlaylist(playlist.id);

    return;
  }

  async updatePlaylist(playlist: Playlist): Promise<void> {
    await playlistoDB.updatePlaylist(playlist);

    return;
  }

  async updatePlaylistWithCoverLoad(playlist: Playlist): Promise<Playlist> {
    const resultPlaylist: PlaylistAPI = {
      ...playlist,
      tracks: [],
    };

    // Обрабатываем обложку плейлиста через внешние сервисы
    if (!playlist.coverKey) {
      const externalServices = ['spotify']; // Можно расширить для других сервисов

      for (const service of externalServices) {
        const serviceData = playlist[`${service}Data` as keyof Playlist] as any;
        if (serviceData?.coverUrl) {
          const coverKey = `playlist_${service}_${serviceData.id}`;
          try {
            await this.addCoverByURL(serviceData.coverUrl, coverKey);
            resultPlaylist.coverKey = coverKey;
            break; // Используем первый найденный сервис
          } catch (error) {
            console.error(`Ошибка при загрузке обложки плейлиста из ${service}:`, error);
          }
        }
      }
    }

    for (const track of playlist.tracks) {
      const resultTrack = { ...track };

      if (!track.coverKey) {
        const service = getTrackExternalServices(track)[0];

        if (!service || !track[`${service}Data`]?.coverUrl) {
          resultPlaylist.tracks.push(resultTrack);
          continue;
        }

        const coverKey = createCoverKey(service, track[`${service}Data`]!.coverUrl);

        try {
          await this.addCoverByURL(track[`${service}Data`]!.coverUrl, coverKey);

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

  async updatePlaylistInfo(playlist: Playlist, updates: Pick<Playlist, 'name' | 'description' | 'coverKey'>): Promise<Playlist> {
    const updatedPlaylist = {
      ...playlist,
      ...(updates.name && { name: updates.name }),
      ...(updates.description !== undefined && { description: updates.description }),
      ...(updates.coverKey && { coverKey: updates.coverKey }),
    };

    await playlistoDB.updatePlaylist(updatedPlaylist);

    return updatedPlaylist;
  }

  async getCover(key: string): Promise<CoverData | undefined> {
    return await playlistoDB.getCover(key);
  }

  /**
   * Экспортирует всю базу данных в JSON формат
   */
  async exportDatabase(): Promise<DatabaseDump> {
    // Получаем все плейлисты
    const playlists = await playlistoDB.getAllPlaylists();

    // Получаем все обложки
    const covers = await playlistoDB.getAllCovers();

    const dump: DatabaseDump = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      playlists,
      covers,
    };

    return dump;
  }

  /**
   * Импортирует данные из JSON файла в базу данных
   */
  async importDatabase(dump: DatabaseDump): Promise<void> {
    // Проверяем версию дампа
    if (!dump.version || !dump.playlists || !dump.covers) {
      throw new Error('Неверный формат файла дампа');
    }

    // Очищаем существующие данные
    await playlistoDB.clearDatabase();

    // Импортируем обложки
    for (const cover of dump.covers) {
      await playlistoDB.addCover(cover.key, cover.base64);
    }

    // Импортируем плейлисты
    for (const playlist of dump.playlists) {
      await playlistoDB.addPlaylist(playlist);
    }
  }
}

// Создаем глобальный экземпляр базы данных
export const service = PlaylistoDBService;
