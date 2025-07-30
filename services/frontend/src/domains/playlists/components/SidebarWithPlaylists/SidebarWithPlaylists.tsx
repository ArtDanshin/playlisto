'use client';

import type { ComponentProps } from 'react';
import { useEffect } from 'react';
import { Plus } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import type { Playlist } from '@/shared/types';
import { Button } from '@/shared/components/ui/Button';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from '@/shared/components/ui/Sidebar';

import { NewPlaylistDialog } from '../NewPlaylistDialog';
import { usePlaylistStore } from '../../store';

import SortablePlaylistItem from './SortablePlaylistItem';

function SidebarWithPlaylists({ ...props }: ComponentProps<typeof Sidebar>) {
  const {
    addPlaylist,
    playlists,
    currentPlaylist,
    setCurrentPlaylist,
    removePlaylist,
    isLoading,
    loadPlaylists,
    updatePlaylistsOrder,
  } = usePlaylistStore();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    loadPlaylists();
  }, [loadPlaylists]);

  const handlePlaylistUploaded = async (playlist: Playlist) => {
    try {
      await addPlaylist(playlist);
    } catch (error) {
      console.error('Failed to add playlist:', error);
      // Здесь можно добавить уведомление пользователю об ошибке
    }
  };

  const handleRemovePlaylist = async (playlist: Playlist) => {
    if (!playlist.id) return;
    try {
      await removePlaylist(playlist.id);
    } catch (error) {
      console.error('Failed to remove playlist:', error);
      // Здесь можно добавить уведомление пользователю об ошибке
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = playlists.findIndex((playlist) => (playlist.id?.toString() || playlist.name) === active.id);
      const newIndex = playlists.findIndex((playlist) => (playlist.id?.toString() || playlist.name) === over?.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        // Новый порядок id
        const ordered = [...playlists];
        const [removed] = ordered.splice(oldIndex, 1);
        ordered.splice(newIndex, 0, removed);
        await updatePlaylistsOrder(ordered.map((p) => p.id!));
      }
    }
  };

  return (
    <Sidebar className='border-r-0' {...props}>
      <SidebarHeader className='p-4'>
        <NewPlaylistDialog onPlaylistAdded={handlePlaylistUploaded}>
          <Button className='w-full'>
            <Plus className='mr-2 h-4 w-4' />
            Добавить плейлист
          </Button>
        </NewPlaylistDialog>
      </SidebarHeader>
      <SidebarContent className='p-4'>
        <h3 className='mb-2 text-sm font-medium text-muted-foreground select-none pointer-events-none'>
          Плейлисты
        </h3>
        <div className='flex flex-col gap-y-1'>
          {isLoading
            ? (
                <div className='text-sm text-muted-foreground'>Загрузка плейлистов...</div>
              )
            : playlists.length === 0
              ? (
                  <div className='text-sm text-muted-foreground'>Нет плейлистов</div>
                )
              : (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={playlists.map((playlist) => playlist.id?.toString() || playlist.name)}
                      strategy={verticalListSortingStrategy}
                    >
                      {playlists.map((playlist) => (
                        <SortablePlaylistItem
                          key={playlist.id || playlist.name}
                          playlist={playlist}
                          isActive={currentPlaylist?.id === playlist.id}
                          onSelect={setCurrentPlaylist}
                          onRemove={handleRemovePlaylist}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>
                )}
        </div>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}

export default SidebarWithPlaylists;
