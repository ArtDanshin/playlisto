'use client';

import { useState, useEffect } from 'react';
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

import type { Track } from '@/shared/types/playlist.ts';

import { usePlaylistStore } from '../../store';

import TrackItem from './TrackItem.tsx';

function TrackList() {
  const { currentPlaylist, updatePlaylistWithCoverLoad, updatePlaylistTracksOrder } = usePlaylistStore();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const tracks = currentPlaylist?.tracks || [];
  
  // Сброс scroll-позиции окна при переключении плейлиста
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [currentPlaylist?.id]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = tracks.findIndex((track) => `${track.title}-${track.artist}` === active.id);
      const newIndex = tracks.findIndex((track) => `${track.title}-${track.artist}` === over?.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newTracks = arrayMove(tracks, oldIndex, newIndex);
        await updatePlaylistTracksOrder({ ...currentPlaylist!, tracks: newTracks })
      }
    }
  };

  const handleManualOrderChange = async (trackIndex: number, newOrder: number) => {
    let realNewOrder = newOrder;
    
    if (newOrder < 1) {
      return;
    } else if (newOrder > tracks.length) {
      realNewOrder = tracks.length;
    }
      
    const newTracks = arrayMove(tracks, trackIndex, realNewOrder);

    await updatePlaylistTracksOrder({ ...currentPlaylist!, tracks: newTracks });
    setEditingIndex(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      modifiers={[]}
    >
      <SortableContext
        items={tracks.map((track) => `${track.title}-${track.artist}`)}
        strategy={verticalListSortingStrategy}
      >
        <div className='grid gap-4'>
          {tracks.map((track, index) => (
            <TrackItem
              key={`${track.title}-${track.artist}-${index}`} // eslint-disable-line react/no-array-index-key
              track={track}
              trackIndex={index}
              isEditing={editingIndex === index}
              onEditStart={() => setEditingIndex(index)}
              onEditCancel={() => setEditingIndex(null)}
              onOrderChange={(newOrder: number) => handleManualOrderChange(index, newOrder)}
              onTrackUpdate={async (updatedTrack: Track) => {
                if (!currentPlaylist) return;

                const updatedTracks = [...currentPlaylist.tracks];
                updatedTracks[index] = updatedTrack;

                const updatedPlaylist = {
                  ...currentPlaylist,
                  tracks: updatedTracks,
                };

                await updatePlaylistWithCoverLoad(updatedPlaylist);
              }}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

export default TrackList;
