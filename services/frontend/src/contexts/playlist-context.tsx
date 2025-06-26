"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { ParsedPlaylist } from '@/lib/m3u-parser'
import { playlistDB } from '@/lib/indexed-db'

interface PlaylistContextType {
  currentPlaylist: ParsedPlaylist | null
  setCurrentPlaylist: (playlist: ParsedPlaylist | null) => void
  playlists: ParsedPlaylist[]
  addPlaylist: (playlist: ParsedPlaylist) => Promise<void>
  removePlaylist: (playlistId: number) => Promise<void>
  updatePlaylist: (playlist: ParsedPlaylist) => Promise<void>
  isLoading: boolean
}

const PlaylistContext = createContext<PlaylistContextType | undefined>(undefined)

interface PlaylistProviderProps {
  children: ReactNode
}

export function PlaylistProvider({ children }: PlaylistProviderProps) {
  const [currentPlaylist, setCurrentPlaylist] = useState<ParsedPlaylist | null>(null)
  const [playlists, setPlaylists] = useState<ParsedPlaylist[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Инициализация базы данных и загрузка плейлистов при монтировании
  useEffect(() => {
    const initializeDB = async () => {
      try {
        await playlistDB.init()
        const savedPlaylists = await playlistDB.getAllPlaylists()
        setPlaylists(savedPlaylists)
      } catch (error) {
        console.error('Failed to initialize database:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeDB()
  }, [])

  const addPlaylist = async (playlist: ParsedPlaylist) => {
    try {
      const playlistId = await playlistDB.addPlaylist(playlist)
      const playlistWithId = { ...playlist, id: playlistId }
      
      setPlaylists(prev => {
        // Проверяем, есть ли уже плейлист с таким именем
        const existingIndex = prev.findIndex(p => p.name === playlist.name)
        if (existingIndex !== -1) {
          // Обновляем существующий плейлист
          const updated = [...prev]
          updated[existingIndex] = playlistWithId
          return updated
        }
        // Добавляем новый плейлист
        return [...prev, playlistWithId]
      })
      setCurrentPlaylist(playlistWithId)
    } catch (error) {
      console.error('Failed to add playlist:', error)
      throw error
    }
  }

  const removePlaylist = async (playlistId: number) => {
    try {
      await playlistDB.deletePlaylist(playlistId)
      setPlaylists(prev => prev.filter(p => p.id !== playlistId))
      
      // Если удаляем текущий плейлист, очищаем его
      if (currentPlaylist?.id === playlistId) {
        setCurrentPlaylist(null)
      }
    } catch (error) {
      console.error('Failed to remove playlist:', error)
      throw error
    }
  }

  const updatePlaylist = async (playlist: ParsedPlaylist) => {
    try {
      await playlistDB.updatePlaylist(playlist)
      setPlaylists(prev => prev.map(p => p.id === playlist.id ? playlist : p))
      
      // Если обновляем текущий плейлист, обновляем его
      if (currentPlaylist?.id === playlist.id) {
        setCurrentPlaylist(playlist)
      }
    } catch (error) {
      console.error('Failed to update playlist:', error)
      throw error
    }
  }

  const value: PlaylistContextType = {
    currentPlaylist,
    setCurrentPlaylist,
    playlists,
    addPlaylist,
    removePlaylist,
    updatePlaylist,
    isLoading
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