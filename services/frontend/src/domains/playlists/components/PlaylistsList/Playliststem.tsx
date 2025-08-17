'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2 } from 'lucide-react';

import { Button } from '@/shared/components/Button';
import type { Playlist } from '@/shared/types/playlist';

interface SortablePlaylistItemProps {
  playlist: Playlist;
  isActive: boolean;
  onRemove: (playlist: Playlist) => void;
}

function SortablePlaylistItem({
  playlist,
  isActive,
  onRemove,
}: SortablePlaylistItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: playlist.id?.toString() || playlist.name,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 rounded-lg p-1 transition-colors ${
        isActive ? 'bg-gray-200' : ''
      } ${isDragging ? 'opacity-50' : ''}`}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className='flex-shrink-0 cursor-grab active:cursor-grabbing'
      >
        <GripVertical className='h-3 w-3 text-muted-foreground' />
      </div>

      {/* Playlist Name */}
      <Button
        variant='ghost'
        size='sm'
        className='flex-1 justify-start hover:bg-transparent cursor-pointer'
        to={`/playlist/${playlist.id}`}
      >
        {playlist.name}
      </Button>

      {/* Remove Button */}
      <Button
        variant='ghost'
        size='sm'
        className='h-8 w-8 p-0 cursor-pointer'
        onClick={() => onRemove(playlist)}
        title='Удалить плейлист'
      >
        <Trash2 className='h-4 w-4' />
      </Button>
    </div>
  );
}

export default SortablePlaylistItem;
