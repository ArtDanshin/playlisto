import { RouterProvider } from 'react-router-dom';

import { Providers } from '@/providers';

import router from './Router';

function App() {
  return (
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  );
}

export default App;
