const trimTrailingSlash = (value) => String(value || '').replace(/\/+$/, '');
const DEFAULT_API_BASE_URL = 'https://ridebuddy0-1.onrender.com/api';

const stripApiSuffix = (value) => {
  const normalized = trimTrailingSlash(value);
  return normalized.endsWith('/api') ? normalized.slice(0, -4) : normalized;
};

const normalizeApiBase = (value) => {
  const normalized = trimTrailingSlash(value);
  if (!normalized) {
    return '';
  }
  return normalized.endsWith('/api') ? normalized : `${normalized}/api`;
};

const ENV_API_URL = process.env.EXPO_PUBLIC_API_URL || process.env.EXPO_PUBLIC_API_URL_WEB || DEFAULT_API_BASE_URL;

export const API_URL = stripApiSuffix(ENV_API_URL);

export const API_BASE_URL = normalizeApiBase(API_URL);
