import { Outlet } from 'react-router-dom';

import {
  SidebarInset,
  SidebarProvider,
} from '@/shared/components/ui/Sidebar';
import { Sidebar } from '@/layout/Sidebar';
import { Header } from '@/layout/Header';

function Root() {
  return (
    <SidebarProvider>
      <Sidebar />
      <SidebarInset>
        <Header />
        <main className='flex-1'>
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default Root;
