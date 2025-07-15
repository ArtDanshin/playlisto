import SidebarWithPlaylists from '@/domains/playlists/components/SidebarWithPlaylists/SidebarWithPlaylists';
import { TrackList } from '@/domains/playlists/components/TrackList';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/shared/components/ui/Breadcrumb';
import { Separator } from '@/shared/components/ui/Separator';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/shared/components/ui/Sidebar';
import { usePlaylistStore } from '@/domains/playlists/store/playlist-store';
import { Providers } from '@/providers';
import { Settings } from '@/shared/components/Settings';

function App() {
  const currentPlaylist = usePlaylistStore((state) => state.currentPlaylist);

  return (
    <Providers>
      <SidebarProvider>
        <SidebarWithPlaylists />
        <SidebarInset>
          <header className='flex h-14 shrink-0 items-center gap-2'>
            <div className='flex flex-1 items-center gap-2 px-3'>
              <SidebarTrigger />
              <Separator orientation='vertical' className='mr-2 h-4' />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbPage className='line-clamp-1'>
                      {currentPlaylist ? currentPlaylist.name : 'Project Management & Task Tracking'}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <div className='ml-auto px-3'>
              <Settings />
            </div>
          </header>
          <div className='flex flex-1 flex-col gap-4 px-4 py-10'>
            {currentPlaylist
              ? (
                  <div className='mx-auto w-full max-w-4xl'>
                    <TrackList tracks={currentPlaylist.tracks} />
                  </div>
                )
              : (
                  <>
                    <div className='mx-auto h-24 w-full max-w-3xl rounded-xl bg-muted/50' />
                    <div className='mx-auto h-full w-full max-w-3xl rounded-xl bg-muted/50' />
                  </>
                )}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </Providers>
  );
}

export default App;
