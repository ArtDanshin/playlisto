"use client"

import { Edit2, Music } from "lucide-react"
import type { Track } from "@/lib/m3u-parser"
import { formatDuration } from "@/lib/utils"
import { TrackEditDialog } from "@/components/track-edit-dialog"
import { Button } from "@/components/ui/Button"
import { usePlaylist } from "@/contexts/playlist-context"

interface TrackListProps {
  tracks: Track[]
}

export function TrackList({ tracks }: TrackListProps) {
  const { currentPlaylist, setCurrentPlaylist, updatePlaylist } = usePlaylist()

  const handleTrackUpdate = async (trackIndex: number, updatedTrack: Track) => {
    if (!currentPlaylist) return

    const updatedTracks = [...currentPlaylist.tracks]
    updatedTracks[trackIndex] = updatedTrack

    const updatedPlaylist = {
      ...currentPlaylist,
      tracks: updatedTracks
    }

    setCurrentPlaylist(updatedPlaylist)
    
    // Сохраняем изменения в базе данных
    try {
      await updatePlaylist(updatedPlaylist)
    } catch (error) {
      console.error('Failed to save track changes:', error)
      // Можно добавить уведомление пользователю об ошибке
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Треки</h2>
      <div className="grid gap-4">
        {tracks.map((track, index) => (
          <TrackItem 
            key={`${track.title}-${track.artist}-${index}`} 
            track={track} 
            onTrackUpdate={(updatedTrack) => handleTrackUpdate(index, updatedTrack)}
          />
        ))}
      </div>
    </div>
  )
}

interface TrackItemProps {
  track: Track
  onTrackUpdate: (updatedTrack: Track) => void
}

function TrackItem({ track, onTrackUpdate }: TrackItemProps) {
  return (
    <div className="flex items-center space-x-4 rounded-lg border p-4 hover:bg-muted/50 transition-colors">
      {/* Album Cover */}
      <div className="flex-shrink-0">
        {track.spotifyData?.album.images && track.spotifyData.album.images.length > 0 ? (
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