"use client"

import * as React from "react"
import { User, Music, Info } from "lucide-react"

import { Button } from '@/components/ui/Button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/Popover'
import { Separator } from '@/components/ui/Separator'

export function NavActions() {
  const [isOpen, setIsOpen] = React.useState(false)

  // TODO: Добавить реальную логику проверки статуса авторизации Spotify
  const spotifyAuthStatus = {
    isAuthenticated: false,
    username: null,
    expiresAt: null,
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 data-[state=open]:bg-accent"
          title="Информация о пользователе и приложении"
        >
          <User className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-80 p-4"
        align="end"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="font-medium">Информация о приложении</span>
          </div>
          
          <Separator />
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Music className="h-4 w-4" />
                <span className="text-sm">Spotify API</span>
              </div>
              <span 
                className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                  spotifyAuthStatus.isAuthenticated 
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" 
                    : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                }`}
              >
                {spotifyAuthStatus.isAuthenticated ? "Подключено" : "Не подключено"}
              </span>
            </div>
            
            {spotifyAuthStatus.isAuthenticated && (
              <div className="text-xs text-muted-foreground space-y-1">
                <div>Пользователь: {spotifyAuthStatus.username}</div>
                {spotifyAuthStatus.expiresAt && (
                  <div>Истекает: {new Date(spotifyAuthStatus.expiresAt).toLocaleDateString()}</div>
                )}
              </div>
            )}
            
            {!spotifyAuthStatus.isAuthenticated && (
              <div className="text-xs text-muted-foreground">
                Для полного доступа к функциям приложения необходимо авторизоваться в Spotify
              </div>
            )}
          </div>
          
          <Separator />
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Info className="h-3 w-3" />
            <span>Playlisto v1.0.0</span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
