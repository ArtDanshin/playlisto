"use client"

import * as React from "react"
import { Plus, Trash2 } from "lucide-react"
import type { ParsedPlaylist } from "@/lib/m3u-parser"

import { Button } from "@/components/ui/Button"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/Sidebar"
import { UploadPlaylistDialog } from "@/components/upload-playlist-dialog"
import { usePlaylist } from "@/contexts/playlist-context"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { addPlaylist, playlists, setCurrentPlaylist, removePlaylist, isLoading } = usePlaylist()

  const handlePlaylistUploaded = async (playlist: ParsedPlaylist) => {
    try {
      await addPlaylist(playlist)
    } catch (error) {
      console.error('Failed to add playlist:', error)
      // Здесь можно добавить уведомление пользователю об ошибке
    }
  }

  const handleRemovePlaylist = async (playlist: ParsedPlaylist) => {
    if (!playlist.id) return
    
    try {
      await removePlaylist(playlist.id)
    } catch (error) {
      console.error('Failed to remove playlist:', error)
      // Здесь можно добавить уведомление пользователю об ошибке
    }
  }

  return (
    <Sidebar className="border-r-0" {...props}>
      <SidebarHeader className="p-4">
        <UploadPlaylistDialog onPlaylistUploaded={handlePlaylistUploaded}>
          <Button className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Добавить плейлист
          </Button>
        </UploadPlaylistDialog>
      </SidebarHeader>
      <SidebarContent className="p-4">
        <h3 className="mb-2 text-sm font-medium text-muted-foreground">
          Плейлисты
        </h3>
        <div className="flex flex-col gap-y-1">
          {isLoading ? (
            <div className="text-sm text-muted-foreground">Загрузка плейлистов...</div>
          ) : playlists.length === 0 ? (
            <div className="text-sm text-muted-foreground">Нет плейлистов</div>
          ) : (
            playlists.map((playlist) => (
              <div key={playlist.id} className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 justify-start"
                  onClick={() => setCurrentPlaylist(playlist)}
                >
                  {playlist.name}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => handleRemovePlaylist(playlist)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
