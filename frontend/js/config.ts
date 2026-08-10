/**
 * Origen de la API REST.
 * - Vacío en local (same-origin / proxy Django+webpack)
 * - En Vercel: ARTEMIS_API_BASE_URL (ej. https://api.artemis.init.com.mx)
 */
export function getApiBaseUrl(): string {
  const raw = (process.env.ARTEMIS_API_BASE_URL || '').trim();
  if (!raw) {
    return '';
  }
  if (raw.startsWith('http://') || raw.startsWith('https://')) {
    return raw.replace(/\/$/, '');
  }
  return `https://${raw.replace(/\/$/, '')}`;
}

export function apiUrl(path: string): string {
  const base = getApiBaseUrl();
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return base ? `${base}${normalized}` : normalized;
}
