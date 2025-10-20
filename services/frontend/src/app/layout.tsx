import type { Metadata } from 'next';

import '../index.css';
import { Providers } from '@/providers';
import { SidebarInset, SidebarProvider } from '@/shared/components/ui/Sidebar';
import { Sidebar } from '@/layout/Sidebar';
import { Header } from '@/layout/Header';

export const metadata: Metadata = {
  title: 'Playlisto',
  description: 'Управление плейлистами из различных источников',
};

function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>
        <Providers>
          <SidebarProvider>
            <Sidebar />
            <SidebarInset>
              <Header />
              <main className='flex-1'>
                {children}
              </main>
            </SidebarInset>
          </SidebarProvider>
        </Providers>
      </body>
    </html>
  );
}

export default RootLayout;

