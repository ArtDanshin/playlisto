'use client';

import type { ComponentProps } from 'react';
import { Plus } from 'lucide-react';

import type { Playlist } from '@/shared/types';
import { Button } from '@/shared/components/ui/Button';
import {
  Sidebar as SidebarBase,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from '@/shared/components/ui/Sidebar';
import { PlaylistsList } from '@/domains/playlists/components/PlaylistsList'
import { NewPlaylistDialog } from '@/domains/playlists/components/NewPlaylistDialog';
import { usePlaylistStore } from '@/domains/playlists/store';

function Sidebar({ ...props }: ComponentProps<typeof SidebarBase>) {
  const { addPlaylist } = usePlaylistStore();

  const handlePlaylistUploaded = async (playlist: Playlist) => {
    try {
      await addPlaylist(playlist);
    } catch (error) {
      console.error('Failed to add playlist:', error);
    }
  };

  return (
    <SidebarBase className='border-r-0' {...props}>
      <SidebarHeader className='p-4'>
        <NewPlaylistDialog onPlaylistAdded={handlePlaylistUploaded}>
          <Button className='w-full'>
            <Plus className='mr-2 h-4 w-4' />
            Добавить плейлист
          </Button>
        </NewPlaylistDialog>
      </SidebarHeader>
      <SidebarContent>
        <PlaylistsList/>
      </SidebarContent>
      <SidebarRail />
    </SidebarBase>
  );
}

export default Sidebar;
