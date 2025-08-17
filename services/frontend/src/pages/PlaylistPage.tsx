import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { TrackList } from '@/domains/playlists/components/TrackList';
import { CurrentPlaylistHeader } from '@/domains/playlists/components/CurrentPlaylistHeader';
import { usePlaylistStore } from '@/domains/playlists/store';

function PlaylistPage() {
  const { id } = useParams<{ id: string; }>();
  const { currentPlaylist, loadPlaylist, setCurrentPlaylist } = usePlaylistStore();

  useEffect(() => {
    if (id) {
      loadPlaylist(id);
    }

    // Очищаем текущий плейлист при размонтировании компонента
    return () => {
      setCurrentPlaylist(null);
    };
  }, [id, loadPlaylist, setCurrentPlaylist]);

  return (
    <div className='flex flex-1 flex-col gap-4 px-4 py-10'>
      {currentPlaylist
        ? (
            <div className='mx-auto w-full max-w-4xl'>
              <div className='space-y-4'>
                <CurrentPlaylistHeader />
                <TrackList />
              </div>
            </div>
          )
        : (
            <>
              <div className='mx-auto h-24 w-full max-w-3xl rounded-xl bg-muted/50' />
              <div className='mx-auto h-full w-full max-w-3xl rounded-xl bg-muted/50' />
            </>
          )}
    </div>
  );
}

export default PlaylistPage;
