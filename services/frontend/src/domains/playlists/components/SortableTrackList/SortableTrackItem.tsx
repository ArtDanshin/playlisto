'use client';

import { useState, useEffect, useRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical, Edit2, Music, X, Check,
} from 'lucide-react';

import type { Track } from '@/shared/utils/m3u-parser';
import { formatDuration } from '@/shared/utils/utils';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { playlistDB } from '@/infrastructure/storage/indexed-db';

import { TrackEditDialog } from '../TrackEditDialog';

interface SortableTrackItemProps {
  track: Track;
  trackIndex: number;
  isEditing: boolean;
  onEditStart: () => void;
  onEditCancel: () => void;
  onOrderChange: (newOrder: number) => void;
  onTrackUpdate: (updatedTrack: Track) => void;
}

function SortableTrackItem({
  track,
  trackIndex,
  isEditing,
  onEditStart,
  onEditCancel,
  onOrderChange,
  onTrackUpdate,
}: SortableTrackItemProps) {
  const [coverBase64, setCoverBase64] = useState<string | null>(null);
  const [manualOrder, setManualOrder] = useState<string>((trackIndex + 1).toString());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadCover() {
      if (track.coverKey) {
        const base64 = await playlistDB.getCover(track.coverKey);
        if (isMounted) setCoverBase64(base64 || null);
      } else {
        setCoverBase64(null);
      }
    }
    loadCover();
    return () => {
      isMounted = false;
    };
  }, [track.coverKey]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | undefined;

    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
      // Инициализируем значение только при начале редактирования
      const initialValue = (trackIndex + 1).toString();
      // Используем setTimeout для избежания прямого вызова setState в useEffect
      timeoutId = setTimeout(() => {
        setManualOrder(initialValue);
      }, 0);
    }
    return () => {
      !!timeoutId && clearTimeout(timeoutId);
    };
  }, [isEditing, trackIndex]); // Возвращаем trackIndex для правильной инициализации

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `${track.title}-${track.artist}`,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleOrderSubmit = () => {
    const newOrder = Number.parseInt(manualOrder, 10);
    if (!Number.isNaN(newOrder) && newOrder > 0 && newOrder !== trackIndex + 1) {
      onOrderChange(newOrder);
    }
    onEditCancel();
  };

  const handleOrderCancel = () => {
    onEditCancel();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleOrderSubmit();
    } else if (e.key === 'Escape') {
      handleOrderCancel();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Только цифры
    const value = e.target.value.replaceAll(/[^\d]/g, '');
    setManualOrder(value);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center space-x-4 rounded-lg border p-4 hover:bg-muted/50 transition-colors ${
        track.isNew ? 'bg-green-50 border-green-200' : ''
      } ${isDragging ? 'opacity-50' : ''}`}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className='flex-shrink-0 cursor-grab active:cursor-grabbing'
      >
        <GripVertical className='h-4 w-4 text-muted-foreground' />
      </div>

      {/* Track Number */}
      <div className='flex-shrink-0 w-16 text-center relative'>
        <div className='flex items-center justify-center gap-1 group'>
          <span className={`text-sm font-medium ${track.isNew ? 'text-green-600' : 'text-muted-foreground'}`}>
            {trackIndex + 1}
          </span>
          {track.isNew && (
            <div className='w-2 h-2 bg-green-500 rounded-full' title='Новый трек' />
          )}
          <Button
            size='sm'
            variant='ghost'
            onClick={onEditStart}
            className='h-4 w-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer'
            tabIndex={-1}
          >
            <Edit2 className='h-3 w-3' />
          </Button>
        </div>

        {/* Tooltip for order editing */}
        {isEditing && (
          <div className='absolute top-full right-0 z-10 bg-white border border-gray-200 rounded-lg shadow-lg p-2 mt-1'>
            <div className='flex items-center gap-1'>
              <Input
                ref={inputRef}
                type='text'
                value={manualOrder}
                onChange={handleInputChange}
                onKeyDown={handleKeyPress}
                className='w-16 h-6 text-xs text-right'
                maxLength={3}
              />
              <Button
                size='sm'
                variant='ghost'
                onClick={handleOrderSubmit}
                className='h-6 w-6 p-0 cursor-pointer hover:bg-green-100 flex-shrink-0'
                tabIndex={-1}
                title='Подтвердить'
              >
                <Check className='h-3 w-3 text-green-600' />
              </Button>
              <Button
                size='sm'
                variant='ghost'
                onClick={handleOrderCancel}
                className='h-6 w-6 p-0 cursor-pointer hover:bg-red-100 flex-shrink-0'
                tabIndex={-1}
                title='Отменить'
              >
                <X className='h-3 w-3 text-red-600' />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Album Cover */}
      <div className='flex-shrink-0'>
        {coverBase64
          ? (
              <img
                src={coverBase64}
                alt={track.spotifyData?.album.name || track.title}
                className='w-16 h-16 rounded-lg object-cover'
              />
            )
          : track.spotifyData?.album.images && track.spotifyData.album.images.length > 0
            ? (
                <img
                  src={track.spotifyData.album.images[0].url}
                  alt={track.spotifyData.album.name}
                  className='w-16 h-16 rounded-lg object-cover'
                />
              )
            : (
                <div className='w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg'>
                  {track.artist.charAt(0).toUpperCase()}
                </div>
              )}
      </div>

      {/* Track Info */}
      <div className='flex-1 min-w-0'>
        <div className='flex items-center gap-2'>
          <h3 className={`text-lg font-semibold truncate ${track.isNew ? 'text-green-700' : ''}`}>
            {track.title}
          </h3>
          {track.isNew && (
            <span className='text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full'>
              Новый
            </span>
          )}
          {track.spotifyId && (
            <div title='Связан со Spotify'>
              <Music className='h-4 w-4 text-green-600' />
            </div>
          )}
        </div>
        <p className='text-sm text-muted-foreground truncate'>{track.artist}</p>
        {track.spotifyData?.album.name && (
          <p className='text-xs text-muted-foreground truncate'>{track.spotifyData.album.name}</p>
        )}
      </div>

      {/* Duration */}
      <div className='flex-shrink-0 text-sm text-muted-foreground'>
        {track.duration && formatDuration(track.duration)}
      </div>

      {/* Edit Button */}
      <div className='flex-shrink-0'>
        <TrackEditDialog
          key={`edit-${track.title}-${track.artist}-${track.spotifyId || 'no-spotify'}`}
          track={track}
          onTrackUpdate={onTrackUpdate}
        >
          <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
            <Edit2 className='h-4 w-4' />
          </Button>
        </TrackEditDialog>
      </div>
    </div>
  );
}

export default SortableTrackItem;
