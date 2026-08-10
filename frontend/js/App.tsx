import * as Sentry from '@sentry/react';
import { useEffect } from 'react';
import { Provider, useDispatch } from 'react-redux';
import { RouterProvider } from 'react-router/dom';

import { ToastProvider } from '@/js/components/Toast';
import { checkAndRefreshToken } from '@/js/features/auth/authSlice';
import router from '@/js/routes';
import { store, type AppDispatch } from '@/js/store';

const AuthBootstrap = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    void dispatch(checkAndRefreshToken());
  }, [dispatch]);

  return <RouterProvider router={router} />;
};

const App = () => (
  <Sentry.ErrorBoundary fallback={<p>An error has occurred</p>}>
    <Provider store={store}>
      <ToastProvider>
        <AuthBootstrap />
      </ToastProvider>
    </Provider>
  </Sentry.ErrorBoundary>
);

export default App;
