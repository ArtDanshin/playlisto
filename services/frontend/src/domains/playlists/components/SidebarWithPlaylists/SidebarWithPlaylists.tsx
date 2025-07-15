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

import type { ParsedPlaylist } from '@/shared/utils/m3u-parser';
import { Button } from '@/shared/components/ui/Button';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from '@/shared/components/ui/Sidebar';

import { UploadPlaylistDialog } from '../UploadPlaylistDialog';
import { usePlaylistStore } from '../../store/playlist-store';

import SortablePlaylistItem from './SortablePlaylistItem';

function SidebarWithPlaylists({ ...props }: ComponentProps<typeof Sidebar>) {
  const {
    addPlaylist,
    playlists,
    currentPlaylist,
    setCurrentPlaylist,
    removePlaylist,
    updatePlaylist,
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

  const handlePlaylistUploaded = async (playlist: ParsedPlaylist) => {
    try {
      await addPlaylist(playlist);
    } catch (error) {
      console.error('Failed to add playlist:', error);
      // Здесь можно добавить уведомление пользователю об ошибке
    }
  };

  const handleRemovePlaylist = async (playlist: ParsedPlaylist) => {
    if (!playlist.id) return;
    try {
      await removePlaylist(playlist.id);
    } catch (error) {
      console.error('Failed to remove playlist:', error);
      // Здесь можно добавить уведомление пользователю об ошибке
    }
  };

  const handlePlaylistUpdated = async (updatedPlaylist: ParsedPlaylist) => {
    try {
      await updatePlaylist(updatedPlaylist);
    } catch (error) {
      console.error('Failed to update playlist:', error);
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
        <UploadPlaylistDialog onPlaylistUploaded={handlePlaylistUploaded}>
          <Button className='w-full'>
            <Plus className='mr-2 h-4 w-4' />
            Добавить плейлист
          </Button>
        </UploadPlaylistDialog>
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
                          onUpdate={handlePlaylistUpdated}
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
