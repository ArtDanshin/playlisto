import type { Track, TrackM3UData } from '@/shared/types/playlist';

import type { FileService as FileServiceImp, TracksWithNewData } from './types';

class FileService implements FileServiceImp {
  async addDataToTracksFromM3UFile(_: File, __: Track[], onProcess?: (current: number, total: number) => void): Promise<TracksWithNewData> {
    let processedCount = 0;
    const toProcessTracksCount = 10;
    const updatedTracks: Track[] = [];

    onProcess && onProcess(processedCount, toProcessTracksCount);

    /* eslint-disable no-loop-func */
    while (processedCount < 10) {
      await new Promise<void>((resolve) => setTimeout(() => {
        processedCount++;
        onProcess && onProcess(processedCount, toProcessTracksCount);

        // TODO: Добавить mock структуры трека
        updatedTracks.push({} as Track);
        resolve();
      }, 200));
    }

    return {
      allTracks: [],
      onlyUpdatedTracks: [],
      notUpdatedTracks: [],
    };
  }

  async getTracksFromM3UFile(): Promise<TrackM3UData[]> {
    return [];
  }
}

// Создаем глобальный экземпляр базы данных
export const service = FileService;
