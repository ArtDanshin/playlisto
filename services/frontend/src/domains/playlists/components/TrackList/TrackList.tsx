'use client';

import { Music } from 'lucide-react';

import type { Track } from '@/shared/types';
import { Button } from '@/shared/components/ui/Button';

import { usePlaylistStore } from '../../store/playlist-store';
import { TrackItem } from '../TrackItem';
import { ExportToSpotifyDialog } from '../ExportToSpotifyDialog';

interface TrackListProps {
  tracks: Track[];
}

function TrackList({ tracks }: TrackListProps) {
  const { currentPlaylist, setCurrentPlaylist, updatePlaylist } = usePlaylistStore();

  const handleTrackUpdate = async (trackIndex: number, updatedTrack: Track) => {
    if (!currentPlaylist) return;

    const updatedTracks = [...currentPlaylist.tracks];
    updatedTracks[trackIndex] = updatedTrack;

    const updatedPlaylist = {
      ...currentPlaylist,
      tracks: updatedTracks,
    };

    setCurrentPlaylist(updatedPlaylist);

    // Сохраняем изменения в базе данных
    try {
      await updatePlaylist(updatedPlaylist);
    } catch (error) {
      console.error('Failed to save track changes:', error);
      // Можно добавить уведомление пользователю об ошибке
    }
  };

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h2 className='text-2xl font-bold'>Треки</h2>
        {currentPlaylist && (
          <ExportToSpotifyDialog playlist={currentPlaylist}>
            <Button variant='outline' size='sm'>
              <Music className='mr-2 h-4 w-4' />
              Экспорт в Spotify
            </Button>
          </ExportToSpotifyDialog>
        )}
      </div>
      <div className='grid gap-4'>
        {tracks.map((track, index) => (
          <TrackItem
            key={`${track.title}-${track.artist}-${index}`} // eslint-disable-line react/no-array-index-key
            track={track}
            onTrackUpdate={(updatedTrack) => handleTrackUpdate(index, updatedTrack)}
          />
        ))}
      </div>
    </div>
  );
}

export default TrackList;
