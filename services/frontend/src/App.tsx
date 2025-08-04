import {
  SidebarInset,
  SidebarProvider,
} from '@/shared/components/ui/Sidebar';
import { Providers } from '@/providers'
import { Sidebar } from '@/layout/Sidebar';
import { Header } from '@/layout/Header';
import { Body } from '@/layout/Body';

function App() {
  return (
    <Providers>
      <SidebarProvider>
        <Sidebar />
        <SidebarInset>
          <Header />
          <Body />
        </SidebarInset>
      </SidebarProvider>
    </Providers>
  );
}

export default App;
