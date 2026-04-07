const FALLBACK_API_URL = 'https://meronyaya.onrender.com/api';

const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '[::1]']);

const isPrivateIpv4 = (host) => {
  if (!host) return false;

  if (host.startsWith('10.')) return true;
  if (host.startsWith('192.168.')) return true;

  const secondOctet = Number(host.split('.')[1]);
  return host.startsWith('172.') && secondOctet >= 16 && secondOctet <= 31;
};

const isUnsafeRemoteHost = (host) => {
  if (!host) return true;
  const normalized = host.toLowerCase();

  return (
    LOCAL_HOSTNAMES.has(normalized) ||
    normalized.endsWith('.local') ||
    isPrivateIpv4(normalized)
  );
};

const isLocalApp = () => {
  if (typeof window === 'undefined') return false;
  return LOCAL_HOSTNAMES.has(window.location.hostname.toLowerCase());
};

const normalizeApiBase = (url) => {
  if (!url) return FALLBACK_API_URL;

  const trimmed = url.trim().replace(/\/+$/, '');
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
};

const resolveApiBaseUrl = () => {
  const configured = normalizeApiBase(import.meta.env.VITE_API_URL);

  try {
    const parsed = new URL(configured);
    const appIsLocal = isLocalApp();

    if (!appIsLocal && (parsed.protocol !== 'https:' || isUnsafeRemoteHost(parsed.hostname))) {
      return FALLBACK_API_URL;
    }

    return configured;
  } catch {
    return FALLBACK_API_URL;
  }
};

export const API_BASE_URL = resolveApiBaseUrl();
export const BACKEND_BASE_URL = API_BASE_URL.replace(/\/api$/, '');
export const WS_BASE_URL = BACKEND_BASE_URL.replace(/^http:/, 'ws:').replace(/^https:/, 'wss:');
