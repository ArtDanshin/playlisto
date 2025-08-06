'use client';

import type { ComponentProps } from 'react';
import { Plus } from 'lucide-react';

import { Button } from '@/shared/components/ui/Button';
import {
  Sidebar as SidebarBase,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from '@/shared/components/ui/Sidebar';
import { PlaylistsList } from '@/domains/playlists/components/PlaylistsList';
import { NewPlaylistDialog } from '@/domains/playlists/components/NewPlaylistDialog';

function Sidebar({ ...props }: ComponentProps<typeof SidebarBase>) {
  return (
    <SidebarBase className='border-r-0' {...props}>
      <SidebarHeader className='p-4'>
        <NewPlaylistDialog>
          <Button className='w-full'>
            <Plus className='mr-2 h-4 w-4' />
            Добавить плейлист
          </Button>
        </NewPlaylistDialog>
      </SidebarHeader>
      <SidebarContent>
        <PlaylistsList />
      </SidebarContent>
      <SidebarRail />
    </SidebarBase>
  );
}

export default Sidebar;
