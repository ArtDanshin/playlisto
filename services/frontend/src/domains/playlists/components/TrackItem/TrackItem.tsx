'use client';

import { useEffect, useState } from 'react';
import { Edit2, Music } from 'lucide-react';

import type { Track } from '@/shared/utils/m3u-parser';
import { formatDuration } from '@/shared/utils/utils';
import { Button } from '@/shared/components/ui/Button';
import { playlistDB } from '@/infrastructure/storage/indexed-db';

import { TrackEditDialog } from '../TrackEditDialog';

interface TrackItemProps {
  track: Track;
  trackIndex: number;
  onTrackUpdate: (updatedTrack: Track) => void;
}

function TrackItem({ track, trackIndex, onTrackUpdate }: TrackItemProps) {
  const [coverBase64, setCoverBase64] = useState<string | null>(null);

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

  return (
    <div className={`flex items-center space-x-4 rounded-lg border p-4 hover:bg-muted/50 transition-colors ${
      track.isNew ? 'bg-green-50 border-green-200' : ''
    }`}
    >
      {/* Track Number */}
      <div className='flex-shrink-0 w-8 text-center'>
        <div className='flex items-center justify-center gap-1'>
          <span className={`text-sm font-medium ${track.isNew ? 'text-green-600' : 'text-muted-foreground'}`}>
            {trackIndex + 1}
          </span>
          {track.isNew && (
            <div className='w-2 h-2 bg-green-500 rounded-full' title='Новый трек' />
          )}
        </div>
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

export default TrackItem;
