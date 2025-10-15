import { createBrowserRouter } from 'react-router-dom';

import { HomePage, PlaylistPage, SettingsPage } from '@/pages';
import { Root } from '@/layout/Root';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'playlist/:id',
        element: <PlaylistPage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
    ],
  },
], {
  basename: import.meta.env.PROD ? '/playlisto' : '/',
});

export default router;
