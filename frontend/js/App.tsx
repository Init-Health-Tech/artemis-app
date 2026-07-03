import * as Sentry from '@sentry/react';
import { RouterProvider } from 'react-router/dom';

import { ToastProvider } from '@/js/components/Toast';
import router from '@/js/routes';

const App = () => (
  <Sentry.ErrorBoundary fallback={<p>An error has occurred</p>}>
    <ToastProvider>
      <RouterProvider router={router} />
    </ToastProvider>
  </Sentry.ErrorBoundary>
);

export default App;
