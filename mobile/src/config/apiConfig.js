import { Platform } from 'react-native';
import Constants from 'expo-constants';

const DEFAULT_PORT = 5002;

const trimTrailingSlash = (value) => value.replace(/\/+$/, '');

const buildApiUrl = (host) => {
  if (!host) {
    return '';
  }

  return `http://${host}:${DEFAULT_PORT}/api`;
};

const getHostFromExpo = () => {
  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.expoGoConfig?.debuggerHost ||
    Constants.manifest2?.extra?.expoGo?.debuggerHost ||
    '';

  return String(hostUri).split(':')[0];
};

const getWebFallbackApiUrl = () => {
  if (typeof window !== 'undefined' && window.location?.hostname) {
    if (!['localhost', '127.0.0.1'].includes(window.location.hostname)) {
      return '';
    }

    return buildApiUrl(window.location.hostname);
  }

  return '';
};

const normalizeApiBaseUrl = (value) => {
  if (!value || typeof value !== 'string') {
    return '';
  }

  const normalized = trimTrailingSlash(value.trim());
  if (!normalized) {
    return '';
  }

  return normalized.endsWith('/api') ? normalized : `${normalized}/api`;
};

const configuredApiUrl = Platform.OS === 'web'
  ? process.env.EXPO_PUBLIC_API_URL_WEB || process.env.EXPO_PUBLIC_API_URL || getWebFallbackApiUrl()
  : process.env.EXPO_PUBLIC_API_URL;

const apiUrlFromEnv = normalizeApiBaseUrl(configuredApiUrl);
const fallbackApiUrl = normalizeApiBaseUrl(buildApiUrl(getHostFromExpo()));

export const API_BASE_URL = apiUrlFromEnv || fallbackApiUrl;
