"use client"

import { createContext, useContext, useState, type ReactNode } from 'react'
import type { ParsedPlaylist } from '@/lib/m3u-parser'

interface PlaylistContextType {
  currentPlaylist: ParsedPlaylist | null
  setCurrentPlaylist: (playlist: ParsedPlaylist | null) => void
  playlists: ParsedPlaylist[]
  addPlaylist: (playlist: ParsedPlaylist) => void
  removePlaylist: (playlistName: string) => void
}

const PlaylistContext = createContext<PlaylistContextType | undefined>(undefined)

interface PlaylistProviderProps {
  children: ReactNode
}

export function PlaylistProvider({ children }: PlaylistProviderProps) {
  const [currentPlaylist, setCurrentPlaylist] = useState<ParsedPlaylist | null>(null)
  const [playlists, setPlaylists] = useState<ParsedPlaylist[]>([])

  const addPlaylist = (playlist: ParsedPlaylist) => {
    setPlaylists(prev => {
      // Проверяем, есть ли уже плейлист с таким именем
      const existingIndex = prev.findIndex(p => p.name === playlist.name)
      if (existingIndex !== -1) {
        // Обновляем существующий плейлист
        const updated = [...prev]
        updated[existingIndex] = playlist
        return updated
      }
      // Добавляем новый плейлист
      return [...prev, playlist]
    })
    setCurrentPlaylist(playlist)
  }

  const removePlaylist = (playlistName: string) => {
    setPlaylists(prev => prev.filter(p => p.name !== playlistName))
    // Если удаляем текущий плейлист, очищаем его
    if (currentPlaylist?.name === playlistName) {
      setCurrentPlaylist(null)
    }
  }

  const value: PlaylistContextType = {
    currentPlaylist,
    setCurrentPlaylist,
    playlists,
    addPlaylist,
    removePlaylist
  }

  return (
    <PlaylistContext.Provider value={value}>
      {children}
    </PlaylistContext.Provider>
  )
}

export function usePlaylist() {
  const context = useContext(PlaylistContext)
  if (context === undefined) {
    throw new Error('usePlaylist must be used within a PlaylistProvider')
  }
  return context
} 