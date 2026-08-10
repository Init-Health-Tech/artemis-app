/** Rutas accesibles solo sin sesión iniciada. */
export const GUEST_ONLY_PATHS = [
  '/',
  '/login',
  '/recuperar-contrasena',
] as const;

export type GuestOnlyPath = (typeof GUEST_ONLY_PATHS)[number];

export const AUTHENTICATED_DEFAULT_PATH = '/dashboard';

export function isGuestOnlyPath(pathname: string): pathname is GuestOnlyPath {
  return (GUEST_ONLY_PATHS as readonly string[]).includes(pathname);
}

export function isSafeInternalRedirect(path: string): boolean {
  return path.startsWith('/') && !path.startsWith('//');
}

export function resolveAuthenticatedRedirect(pathname: string, search: string): string {
  if (pathname === '/login') {
    const redirect = new URLSearchParams(search).get('redirect');
    if (redirect && isSafeInternalRedirect(redirect)) {
      return redirect;
    }
  }
  return AUTHENTICATED_DEFAULT_PATH;
}

export type AuthSessionSnapshot = {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: { is_active: boolean } | null;
};

export type GuestRouteDecision =
  | { status: 'loading' }
  | { status: 'redirect'; to: string }
  | { status: 'allow' };

export function getGuestRouteDecision(
  session: AuthSessionSnapshot,
  pathname: string,
  search: string,
): GuestRouteDecision {
  const { isLoading, isAuthenticated, user } = session;

  if (isLoading || (isAuthenticated && user === null)) {
    return { status: 'loading' };
  }

  if (isAuthenticated && user?.is_active) {
    return {
      status: 'redirect',
      to: resolveAuthenticatedRedirect(pathname, search),
    };
  }

  return { status: 'allow' };
}
