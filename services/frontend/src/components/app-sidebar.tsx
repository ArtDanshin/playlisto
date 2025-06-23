"use client"

import * as React from "react"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/Button"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/Sidebar"

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
  return (
    <Sidebar className="border-r-0" {...props}>
      <SidebarHeader className="p-4">
        <Button className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Добавить плейлист
        </Button>
      </SidebarHeader>
      <SidebarContent className="p-4">
        <h3 className="mb-2 text-sm font-medium text-muted-foreground">
          Плейлисты
        </h3>
        <div className="flex flex-col gap-y-1">
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
