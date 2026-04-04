const trimTrailingSlash = (value) => String(value || '').replace(/\/+$/, '');

const normalizeApiBase = (value) => {
  const normalized = trimTrailingSlash(value);
  if (!normalized) {
    return '';
  }
  return normalized.endsWith('/api') ? normalized : `${normalized}/api`;
};

export const API_URL = trimTrailingSlash(
  process.env.EXPO_PUBLIC_API_URL || 'https://ridebuddy0-1.onrender.com'
);

export const API_BASE_URL = normalizeApiBase(API_URL);
