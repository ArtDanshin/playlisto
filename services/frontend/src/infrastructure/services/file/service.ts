import { Parser, type Segment } from 'm3u8-parser';

import type { Track, TrackM3UData } from '@/shared/types/playlist';
import { extractArtistAndTitle, isExactM3UMatch, updateTrackDataFromM3U } from '@/shared/utils/file';

import type { FileService as FileServiceImp, TracksWithNewData } from './types';

class FileService implements FileServiceImp {
  async addDataToTracksFromM3UFile(
    file: File,
    tracks: Track[],
    onProcess?: (current: number, total: number) => void
  ): Promise<TracksWithNewData> {
    let processedCount = 0;
    onProcess && onProcess(processedCount, tracks.length);

    let m3uTracks: TrackM3UData[];
    
    try {
      m3uTracks = await this.getTracksFromM3UFile(file);
    } catch (error) {
      console.error('M3U update error:', error);
      throw new Error('Произошла ошибка при обработке M3U файла');
    }

    const resultTracks: Track[] = [];
    const updatedTracks: Track[] = [];
    const notUpdatedTracks: Track[] = [];

    for (const track of tracks) {
      // Ищем соответствующий трек в M3U файле
      const exactMatchTrack = m3uTracks.find((m3uTrack) => isExactM3UMatch(track.artist, track.title, m3uTrack));

      if (exactMatchTrack) {
        const updatedTrack: Track = updateTrackDataFromM3U(track, exactMatchTrack);
        resultTracks.push(updatedTrack);
        updatedTracks.push(updatedTrack);
      } else {
        resultTracks.push(track)
        notUpdatedTracks.push(track);
      }

      processedCount++;
      onProcess && onProcess(processedCount, tracks.length);
    }

    return {
      allTracks: [],
      onlyUpdatedTracks: [],
      notUpdatedTracks: []
    };
  }

  async getTracksFromM3UFile(file: File): Promise<TrackM3UData[]> {
    const content = await file.text();

    const parser = new Parser();
  
    // Push the content to the parser
    parser.push(content);
    parser.end();
  
    const { manifest } = parser;
    const tracks: TrackM3UData[] = [];
  
    // Process segments from the manifest
    if (manifest.segments && manifest.segments.length > 0) {
      manifest.segments.forEach((segment: Segment) => {
        let title = 'Unknown Title';
        let artist = 'Unknown Artist';
  
        // Try to extract title from segment title
        if (segment.title) {
          const parsedTitle = extractArtistAndTitle(segment.title);
          title = parsedTitle.title;
          artist = parsedTitle.artist;
        }
  
        // If no title in segment, try to extract from URI
        if (title === 'Unknown Title' && segment.uri) {
          const filename = segment.uri.split('/').pop() || '';
          title = filename.replace(/\.[^/.]+$/, ''); // Remove extension
        }
  
        const trackM3UData: TrackM3UData = {
          title,
          artist,
          url: segment.uri || '',
          duration: segment.duration || 0,
        };
  
        tracks.push(trackM3UData);
      });
    }
  
    // If no segments found, try parsing as simple M3U
    if (tracks.length === 0) {
      return this.getTracksFromSimpleM3UFile(content);
    }
  
    return tracks
  }

  // Parse simple M3U files (without extended info)
  private getTracksFromSimpleM3UFile(content: string): TrackM3UData[] {
    const lines = content.split('\n').map((line) => line.trim()).filter((line) => line.length > 0);
    const tracks: TrackM3UData[] = [];
  
    let trackIndex = 0;
    for (const line of lines) {
      // Skip comments and empty lines
      if (line.startsWith('#') || line.length === 0) {
        continue;
      }
  
      // Check if this line is a URL
      if (line.startsWith('http') || line.startsWith('file://')) {
        // Try to extract title from filename
        const urlParts = line.split('/');
        const filename = urlParts.at(-1);
        const title = filename?.replace(/\.[^/.]+$/, '') || 'Unknown Title'; // Remove extension
  
        const trackM3UData: TrackM3UData = {
          title: title || 'Unknown Title',
          artist: 'Unknown Artist',
          url: line,
          duration: 0,
        };
  
        tracks.push(trackM3UData);
        trackIndex++;
      }
    }
  
    return tracks;
  }
}

// Создаем глобальный экземпляр базы данных
export const service = FileService;
