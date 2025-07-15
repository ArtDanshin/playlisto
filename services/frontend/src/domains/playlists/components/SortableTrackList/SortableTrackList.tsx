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

import type { Track } from '@/shared/utils/m3u-parser';

import { usePlaylistStore } from '../../store/playlist-store';
import { BatchSpotifyRecognition } from '../BatchSpotifyRecognition';

import SortableTrackItem from './SortableTrackItem.tsx';

interface SortableTrackListProps {
  tracks: Track[];
}

function SortableTrackList({ tracks }: SortableTrackListProps) {
  const { currentPlaylist, updateCurrentPlaylistTracks, updatePlaylist } = usePlaylistStore();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

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

  const updatePlaylistOrder = async (newTracks: Track[]) => {
    if (!currentPlaylist) return;

    const updatedPlaylist = {
      ...currentPlaylist,
      tracks: newTracks,
    };

    updateCurrentPlaylistTracks(updatedPlaylist.tracks);

    try {
      await updatePlaylist(updatedPlaylist);
    } catch (error) {
      console.error('Failed to update playlist order:', error);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = tracks.findIndex((track) => `${track.title}-${track.artist}` === active.id);
      const newIndex = tracks.findIndex((track) => `${track.title}-${track.artist}` === over?.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newTracks = arrayMove(tracks, oldIndex, newIndex);
        await updatePlaylistOrder(newTracks);
      }
    }
  };

  const handleManualOrderChange = async (trackIndex: number, newOrder: number) => {
    if (newOrder < 1 || newOrder > tracks.length) return;

    const newTracks = [...tracks];
    const track = newTracks.splice(trackIndex, 1)[0];
    newTracks.splice(newOrder - 1, 0, track);

    await updatePlaylistOrder(newTracks);
    setEditingIndex(null);
  };

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h2 className='text-2xl font-bold'>Треки</h2>
        <BatchSpotifyRecognition tracks={tracks} />
      </div>

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
              <SortableTrackItem
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

                  updateCurrentPlaylistTracks(updatedPlaylist.tracks);

                  try {
                    await updatePlaylist(updatedPlaylist);
                  } catch (error) {
                    console.error('Failed to save track changes:', error);
                  }
                }}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

export default SortableTrackList;
