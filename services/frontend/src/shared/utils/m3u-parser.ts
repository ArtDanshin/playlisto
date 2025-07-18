import { Parser, type Segment } from 'm3u8-parser';

import type { Playlist, Track, M3UData } from '@/shared/types';

import { createTrackFromM3U } from './playlist-utils';

export interface SpotifyTrackData {
  id: string;
  name: string;
  artists: Array<{ id: string; name: string; }>;
  album: {
    id: string;
    name: string;
    images: Array<{ url: string; height: number; width: number; }>;
  };
  duration_ms: number;
  external_urls: {
    spotify: string;
  };
  uri: string;
}

export function parseM3U(content: string): Playlist {
  const parser = new Parser();

  // Push the content to the parser
  parser.push(content);
  parser.end();

  const { manifest } = parser;
  const tracks: Track[] = [];

  // Process segments from the manifest
  if (manifest.segments && manifest.segments.length > 0) {
    manifest.segments.forEach((segment: Segment, index: number) => {
      let title = 'Unknown Title';
      let artist = 'Unknown Artist';

      // Try to extract title from segment title
      if (segment.title) {
        const artistTitle = extractArtistAndTitle(segment.title);
        title = artistTitle.title;
        artist = artistTitle.artist;
      }

      // If no title in segment, try to extract from URI
      if (title === 'Unknown Title' && segment.uri) {
        const filename = segment.uri.split('/').pop() || '';
        title = filename.replace(/\.[^/.]+$/, ''); // Remove extension
      }

      const m3uData: M3UData = {
        title,
        artist,
        url: segment.uri || '',
        duration: segment.duration || 0,
      };

      tracks.push(createTrackFromM3U(m3uData, index + 1));
    });
  }

  // If no segments found, try parsing as simple M3U
  if (tracks.length === 0) {
    return parseSimpleM3U(content);
  }

  return {
    name: 'Imported Playlist',
    order: 0,
    tracks,
  };
}

export function extractArtistAndTitle(trackInfo: string): { artist: string; title: string; } {
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
export function parseSimpleM3U(content: string): Playlist {
  const lines = content.split('\n').map((line) => line.trim()).filter((line) => line.length > 0);
  const tracks: Track[] = [];

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

      const m3uData: M3UData = {
        title: title || 'Unknown Title',
        artist: 'Unknown Artist',
        url: line,
        duration: 0,
      };

      tracks.push(createTrackFromM3U(m3uData, trackIndex + 1));
      trackIndex++;
    }
  }

  return {
    name: 'Imported Playlist',
    order: 0,
    tracks,
  };
}
