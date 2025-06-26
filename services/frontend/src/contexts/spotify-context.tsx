"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { SpotifyService } from '@/lib/spotify-service'
import type { SpotifyAuthStatus, SpotifyUser } from '@/lib/spotify-service'

interface SpotifyContextType {
  authStatus: SpotifyAuthStatus
  isLoading: boolean
  error: string | null
  login: () => Promise<void>
  logout: () => void
  refreshUserProfile: () => Promise<void>
}

const SpotifyContext = createContext<SpotifyContextType | undefined>(undefined)

export function SpotifyProvider({ children }: { children: ReactNode }) {
  const [authStatus, setAuthStatus] = useState<SpotifyAuthStatus>({
    isAuthenticated: false,
    user: null,
    expiresAt: null,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Инициализация при загрузке компонента
  useEffect(() => {
    initializeSpotify()
  }, [])

  // Обработка callback от Spotify при загрузке страницы
  useEffect(() => {
    handleSpotifyCallback()
  }, [])

  const initializeSpotify = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Проверяем статус авторизации
      const status = SpotifyService.getAuthStatus()
      setAuthStatus(status)
      
      // Если токен истек, пытаемся обновить его
      if (status.isAuthenticated && status.expiresAt && Date.now() >= status.expiresAt - 60000) {
        const refreshed = await SpotifyService.refreshToken()
        if (refreshed) {
          const newStatus = SpotifyService.getAuthStatus()
          setAuthStatus(newStatus)
        } else {
          // Если не удалось обновить токен, очищаем состояние
          setAuthStatus({
            isAuthenticated: false,
            user: null,
            expiresAt: null,
          })
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize Spotify')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSpotifyCallback = async () => {
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    const error = urlParams.get('error')
    
    if (error) {
      setError(`Spotify authorization error: ${error}`)
      // Очищаем URL параметры
      window.history.replaceState({}, document.title, window.location.pathname)
      return
    }
    
    if (code) {
      try {
        setIsLoading(true)
        setError(null)
        
        const success = await SpotifyService.handleCallback()
        if (success) {
          const newStatus = SpotifyService.getAuthStatus()
          setAuthStatus(newStatus)
          // Очищаем URL параметры
          window.history.replaceState({}, document.title, window.location.pathname)
        } else {
          setError('Failed to complete Spotify authorization')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to complete Spotify authorization')
      } finally {
        setIsLoading(false)
      }
    }
  }

  const login = async () => {
    try {
      setError(null)
      await SpotifyService.initiateAuth()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initiate Spotify login')
    }
  }

  const logout = () => {
    SpotifyService.logout()
    setAuthStatus({
      isAuthenticated: false,
      user: null,
      expiresAt: null,
    })
    setError(null)
  }

  const refreshUserProfile = async () => {
    if (!authStatus.isAuthenticated) return
    
    try {
      setError(null)
      const user = await SpotifyService.fetchUserProfile()
      setAuthStatus(prev => ({
        ...prev,
        user,
      }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh user profile')
    }
  }

  const value: SpotifyContextType = {
    authStatus,
    isLoading,
    error,
    login,
    logout,
    refreshUserProfile,
  }

  return (
    <SpotifyContext.Provider value={value}>
      {children}
    </SpotifyContext.Provider>
  )
}

export function useSpotify() {
  const context = useContext(SpotifyContext)
  if (context === undefined) {
    throw new Error('useSpotify must be used within a SpotifyProvider')
  }
  return context
} 