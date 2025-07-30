import type { TrackM3UData } from '@/shared/types/playlist';
import type { Track } from '@/shared/types/playlist';

export interface FileService {
  addDataToTracksFromM3UFile: (file: File, tracks: Track[], onProcess?: (current: number, total: number) => void) => Promise<TracksWithNewData>;
  getTracksFromM3UFile: (file: File) => Promise<TrackM3UData[]>;
};

export interface TracksWithNewData {
  allTracks: Track[],
  onlyUpdatedTracks: Track[],
  notUpdatedTracks: Track[],
}