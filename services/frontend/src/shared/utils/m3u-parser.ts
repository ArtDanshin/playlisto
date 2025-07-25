import { Parser, type Segment } from 'm3u8-parser';

import type { TrackM3UData } from '@/shared/types/file-source';

export function parseM3U(content: string): TrackM3UData[] {
  const parser = new Parser();

  // Push the content to the parser
  parser.push(content);
  parser.end();

  const { manifest } = parser;
  const tracks: TrackM3UData[] = [];

  // Process segments from the manifest
  if (manifest.segments && manifest.segments.length > 0) {
    manifest.segments.forEach((segment: Segment, index: number) => {
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
    return parseSimpleM3U(content);
  }

  return tracks
}

function extractArtistAndTitle(trackInfo: string): { artist: string; title: string; } {
  const dashIndex = trackInfo.indexOf(' - ');

  if (dashIndex !== -1) {
    return {
      artist: trackInfo.slice(0, Math.max(0, dashIndex)).trim(),
      title: trackInfo.slice(Math.max(0, dashIndex + 3)).trim(),
    };
  }

  // If no dash found, treat the whole string as title
  return {
    artist: 'Unknown Artist',
    title: trackInfo.trim(),
  };
}

// Helper function to parse simple M3U files (without extended info)
function parseSimpleM3U(content: string): TrackM3UData[] {
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
