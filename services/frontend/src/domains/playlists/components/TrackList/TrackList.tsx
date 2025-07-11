"use client"

import type { Track } from "@/shared/utils/m3u-parser"

import { usePlaylistStore } from "../../store/playlist-store"
import { TrackItem } from "../TrackItem"

interface TrackListProps {
  tracks: Track[]
}

function TrackList({ tracks }: TrackListProps) {
  const { currentPlaylist, setCurrentPlaylist, updatePlaylist } = usePlaylistStore()

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

export default TrackList;