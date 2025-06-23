"use client"

import type { Track } from "@/lib/m3u-parser"
import { formatDuration } from "@/lib/utils"

interface TrackListProps {
  tracks: Track[]
}

export function TrackList({ tracks }: TrackListProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Треки</h2>
      <div className="grid gap-4">
        {tracks.map((track, index) => (
          <TrackItem key={index} track={track} />
        ))}
      </div>
    </div>
  )
}

interface TrackItemProps {
  track: Track
}

function TrackItem({ track }: TrackItemProps) {
  return (
    <div className="flex items-center space-x-4 rounded-lg border p-4 hover:bg-muted/50 transition-colors">
      {/* Album Cover Placeholder */}
      <div className="flex-shrink-0">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
          {track.artist.charAt(0).toUpperCase()}
        </div>
      </div>
      
      {/* Track Info */}
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-semibold truncate">{track.title}</h3>
        <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
      </div>
      
      {/* Duration if available */}
      {track.duration && (
        <div className="flex-shrink-0 text-sm text-muted-foreground">
          {formatDuration(track.duration)}
        </div>
      )}
    </div>
  )
} 