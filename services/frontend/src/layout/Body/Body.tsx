import { SortableTrackList } from '@/domains/playlists/components/SortableTrackList';
import { CurrentPlaylistHeader } from '@/domains/playlists/components/CurrentPlaylistHeader';
import { usePlaylistStore } from '@/domains/playlists/store';

function App() {
  const currentPlaylist = usePlaylistStore((state) => state.currentPlaylist);

  return (
    <div className='flex flex-1 flex-col gap-4 px-4 py-10'>
      {currentPlaylist
        ? (
            <div className='mx-auto w-full max-w-4xl'>
              <div className='space-y-4'>
                <CurrentPlaylistHeader />
                <SortableTrackList tracks={currentPlaylist.tracks} />
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

export default App;
