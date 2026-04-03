import { Platform } from 'react-native';

const DEFAULT_PORT = 5001;

const getWebFallbackApiUrl = () => {
  if (typeof window !== 'undefined' && window.location?.hostname) {
    const host = window.location.hostname;
    return `http://${host}:${DEFAULT_PORT}/api`;
  }
  return `http://localhost:${DEFAULT_PORT}/api`;
};

const FALLBACK_API_URL = Platform.select({
  android: `http://10.0.2.2:${DEFAULT_PORT}/api`,
  ios: `http://localhost:${DEFAULT_PORT}/api`,
  web: getWebFallbackApiUrl(),
  default: `http://localhost:${DEFAULT_PORT}/api`
});

const trimTrailingSlash = (value) => value.replace(/\/+$/, '');

const normalizeApiBaseUrl = (value) => {
  if (!value || typeof value !== 'string') {
    return FALLBACK_API_URL;
  }

  const normalized = trimTrailingSlash(value.trim());
  if (!normalized) {
    return FALLBACK_API_URL;
  }

  return normalized.endsWith('/api') ? normalized : `${normalized}/api`;
};

const configuredApiUrl = Platform.OS === 'web'
  ? process.env.EXPO_PUBLIC_API_URL_WEB || getWebFallbackApiUrl()
  : process.env.EXPO_PUBLIC_API_URL;

export const API_BASE_URL = normalizeApiBaseUrl(configuredApiUrl);
