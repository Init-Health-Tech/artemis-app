import { useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router';

import SessionLoading from '@/js/components/SessionLoading';
import type { RootState } from '@/js/store';

const ProtectedRoute = () => {
  const location = useLocation();
  const isAuthenticated = useSelector((s: RootState) => s.auth.isAuthenticated);
  const isLoading = useSelector((s: RootState) => s.auth.isLoading);
  const user = useSelector((s: RootState) => s.auth.user);

  if (isLoading || (isAuthenticated && user === null)) {
    return <SessionLoading />;
  }

  if (!isAuthenticated || !user?.is_active) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate replace to={`/login?redirect=${redirect}`} />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
