import { Parser, type Segment } from 'm3u8-parser'

export interface SpotifyTrackData {
  id: string
  name: string
  artists: Array<{ id: string; name: string }>
  album: {
    id: string
    name: string
    images: Array<{ url: string; height: number; width: number }>
  }
  duration_ms: number
  external_urls: {
    spotify: string
  }
  uri: string
}

export interface Track {
  title: string
  artist: string
  url?: string
  duration?: number
  // Spotify integration
  spotifyId?: string
  spotifyData?: SpotifyTrackData
  coverKey?: string // ключ к обложке в IndexedDB
}

export interface ParsedPlaylist {
  id?: number
  name: string
  tracks: Track[]
  createdAt?: string
}

export function parseM3U(content: string): ParsedPlaylist {
  const parser = new Parser()
  
  // Push the content to the parser
  parser.push(content)
  parser.end()
  
  const manifest = parser.manifest
  const tracks: Track[] = []
  
  // Process segments from the manifest
  if (manifest.segments && manifest.segments.length > 0) {
    manifest.segments.forEach((segment: Segment) => {
      let title = 'Unknown Title'
      let artist = 'Unknown Artist'
      
      // Try to extract title from segment title
      if (segment.title) {
        const artistTitle = extractArtistAndTitle(segment.title)
        title = artistTitle.title
        artist = artistTitle.artist
      }
      
      // If no title in segment, try to extract from URI
      if (title === 'Unknown Title' && segment.uri) {
        const filename = segment.uri.split('/').pop() || ''
        title = filename.replace(/\.[^/.]+$/, '') // Remove extension
      }
      
      tracks.push({
        title,
        artist,
        url: segment.uri,
        duration: segment.duration || undefined
      })
    })
  }
  
  // If no segments found, try parsing as simple M3U
  if (tracks.length === 0) {
    return parseSimpleM3U(content)
  }
  
  return {
    name: 'Imported Playlist',
    tracks
  }
}

export function extractArtistAndTitle(trackInfo: string): { artist: string; title: string } {
  const dashIndex = trackInfo.indexOf(' - ')
  if (dashIndex !== -1) {
    return {
      artist: trackInfo.substring(0, dashIndex).trim(),
      title: trackInfo.substring(dashIndex + 3).trim()
    }
  }
  
  // If no dash found, treat the whole string as title
  return {
    artist: 'Unknown Artist',
    title: trackInfo.trim()
  }
}

// Helper function to parse simple M3U files (without extended info)
export function parseSimpleM3U(content: string): ParsedPlaylist {
  const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0)
  const tracks: Track[] = []
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    
    // Skip comments and empty lines
    if (line.startsWith('#') || line.length === 0) {
      continue
    }
    
    // Check if this line is a URL
    if (line.startsWith('http') || line.startsWith('file://')) {
      // Try to extract title from filename
      const urlParts = line.split('/')
      const filename = urlParts[urlParts.length - 1]
      const title = filename.replace(/\.[^/.]+$/, '') // Remove extension
      
      tracks.push({
        title: title || 'Unknown Title',
        artist: 'Unknown Artist',
        url: line
      })
    }
  }
  
  return {
    name: 'Imported Playlist',
    tracks
  }
} 