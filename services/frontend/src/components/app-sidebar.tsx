"use client"

import * as React from "react"
import { Plus } from "lucide-react"
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

// This is sample data.
const data = {
  playlists: [
    { name: "Favorite songs" },
    { name: "Rock" },
    { name: "Pop" },
    { name: "Jazz" },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { addPlaylist, playlists, setCurrentPlaylist } = usePlaylist()

  const handlePlaylistUploaded = (playlist: ParsedPlaylist) => {
    addPlaylist(playlist)
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
          {/* Отображаем загруженные плейлисты */}
          {playlists.map((playlist) => (
            <Button
              key={playlist.name}
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={() => setCurrentPlaylist(playlist)}
            >
              {playlist.name}
            </Button>
          ))}
          {/* Отображаем примеры плейлистов */}
          {data.playlists.map((playlist) => (
            <Button
              key={playlist.name}
              variant="ghost"
              size="sm"
              className="w-full justify-start"
            >
              {playlist.name}
            </Button>
          ))}
        </div>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
