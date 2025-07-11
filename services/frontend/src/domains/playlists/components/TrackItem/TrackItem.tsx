"use client"

import { useEffect, useState } from "react"
import { Edit2, Music } from "lucide-react"

import type { Track } from "@/shared/utils/m3u-parser"
import { formatDuration } from "@/shared/utils/utils"
import { Button } from "@/shared/components/ui/Button"
import { playlistDB } from "@/infrastructure/storage/indexed-db"

import { TrackEditDialog } from "../TrackEditDialog"

interface TrackItemProps {
  track: Track
  onTrackUpdate: (updatedTrack: Track) => void
}

function TrackItem({ track, onTrackUpdate }: TrackItemProps) {
  const [coverBase64, setCoverBase64] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    async function loadCover() {
      if (track.coverKey) {
        const base64 = await playlistDB.getCover(track.coverKey)
        if (isMounted) setCoverBase64(base64 || null)
      } else {
        setCoverBase64(null)
      }
    }
    loadCover()
    return () => { isMounted = false }
  }, [track.coverKey])

  return (
    <div className="flex items-center space-x-4 rounded-lg border p-4 hover:bg-muted/50 transition-colors">
      {/* Album Cover */}
      <div className="flex-shrink-0">
        {coverBase64 ? (
          <img
            src={coverBase64}
            alt={track.spotifyData?.album.name || track.title}
            className="w-16 h-16 rounded-lg object-cover"
          />
        ) : track.spotifyData?.album.images && track.spotifyData.album.images.length > 0 ? (
          <img
            src={track.spotifyData.album.images[0].url}
            alt={track.spotifyData.album.name}
            className="w-16 h-16 rounded-lg object-cover"
          />
        ) : (
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
            {track.artist.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      
      {/* Track Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold truncate">{track.title}</h3>
          {track.spotifyId && (
            <div title="Связан со Spotify">
              <Music className="h-4 w-4 text-green-600" />
            </div>
          )}
        </div>
        <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
        {track.spotifyData?.album.name && (
          <p className="text-xs text-muted-foreground truncate">{track.spotifyData.album.name}</p>
        )}
      </div>
      
      {/* Duration */}
      <div className="flex-shrink-0 text-sm text-muted-foreground">
        {track.duration && formatDuration(track.duration)}
      </div>

      {/* Edit Button */}
      <div className="flex-shrink-0">
        <TrackEditDialog 
          key={`edit-${track.title}-${track.artist}-${track.spotifyId || 'no-spotify'}`}
          track={track} 
          onTrackUpdate={onTrackUpdate}
        >
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Edit2 className="h-4 w-4" />
          </Button>
        </TrackEditDialog>
      </div>
    </div>
  )
}

export default TrackItem;