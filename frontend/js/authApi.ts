import axios from 'axios';

import { getApiBaseUrl } from '@/js/config';

/** Login, refresh, logout — sends HttpOnly refresh cookie (withCredentials). */
const authApi = axios.create({
  baseURL: `${getApiBaseUrl()}/api`,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

export default authApi;
