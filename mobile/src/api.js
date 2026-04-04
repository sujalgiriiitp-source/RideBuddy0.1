import { API_BASE_URL } from './config/apiConfig';

export const apiRequest = async (path, options = {}) => {
  const {
    method = 'GET',
    body,
    token,
    headers = {},
    timeoutMs = 15000
  } = options;

  const requestHeaders = {
    'Content-Type': 'application/json',
    ...headers
  };

  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  if (!API_BASE_URL) {
    throw new Error('Missing API URL. Set EXPO_PUBLIC_API_URL in mobile/.env to http://<LOCAL_IP>:5002/api');
  }

  const url = `${API_BASE_URL}${normalizedPath}`;

  if (__DEV__) {
    console.log('[API][REQ]', {
      method,
      url,
      hasToken: Boolean(token),
      body
    });
  }

  let response;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal
    });

    if (__DEV__) {
      console.log('[API][RES]', {
        method,
        url,
        status: response.status,
        ok: response.ok
      });
    }
  } catch (error) {
    if (__DEV__) {
      console.log('[API][ERR]', {
        method,
        url,
        message: error?.message
      });
    }

    if (error?.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }

    if (error?.message?.includes('Failed to fetch') || error?.message?.includes('Network request failed')) {
      throw new Error(`Unable to reach backend at ${API_BASE_URL}. Ensure phone and backend are on same Wi-Fi.`);
    }
    throw new Error(error?.message || 'Network request failed');
  } finally {
    clearTimeout(timeoutId);
  }

  const payload = await response.json().catch(() => ({
    success: false,
    message: 'Invalid server response',
    data: null
  }));

  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || 'Request failed');
  }

  return payload;
};

export const apiBaseUrl = API_BASE_URL;
