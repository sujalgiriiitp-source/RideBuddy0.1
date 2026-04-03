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

    if (error?.message?.includes('Failed to fetch')) {
      throw new Error(`Failed to fetch. Please check backend at ${API_BASE_URL}.`);
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
