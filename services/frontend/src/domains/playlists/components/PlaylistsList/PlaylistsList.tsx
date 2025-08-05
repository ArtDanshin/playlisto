'use client';

import { useEffect } from 'react';
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
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import type { Playlist } from '@/shared/types';

import { usePlaylistStore } from '../../store';

import PlaylistsItem from './Playliststem';

function PlaylistsList() {
  const {
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

  const handleRemovePlaylist = async (playlist: Playlist) => {
    if (!playlist.id) return;
    try {
      await removePlaylist(playlist);
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
        const ordered = arrayMove(playlists, oldIndex, newIndex);
        await updatePlaylistsOrder(ordered);
      }
    }
  };

  return (
    <div className='p-4'>
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
                      <PlaylistsItem
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
    </div>
  );
}

export default PlaylistsList;
