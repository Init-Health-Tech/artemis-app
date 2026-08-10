import { useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router';

import SessionLoading from '@/js/components/SessionLoading';
import type { RootState } from '@/js/store';
import { getGuestRouteDecision } from '@/js/utils/authRoutes';

const GuestOnlyRoute = () => {
  const location = useLocation();
  const isAuthenticated = useSelector((s: RootState) => s.auth.isAuthenticated);
  const isLoading = useSelector((s: RootState) => s.auth.isLoading);
  const user = useSelector((s: RootState) => s.auth.user);

  const decision = getGuestRouteDecision(
    { isLoading, isAuthenticated, user },
    location.pathname,
    location.search,
  );

  if (decision.status === 'loading') {
    return <SessionLoading />;
  }

  if (decision.status === 'redirect') {
    return <Navigate replace to={decision.to} />;
  }

  return <Outlet />;
};

export default GuestOnlyRoute;
