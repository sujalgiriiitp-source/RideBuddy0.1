import { API_BASE_URL, API_URL } from './config';
import { beginApiRequest, endApiRequest, setApiOffline } from './utils/apiActivity';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isLikelyNetworkError = (error) => {
  const message = String(error?.message || '').toLowerCase();
  return (
    message.includes('failed to fetch') ||
    message.includes('network request failed') ||
    message.includes('network') ||
    message.includes('internet')
  );
};

const buildFriendlyStatusMessage = (status, payloadMessage) => {
  if (payloadMessage) {
    return payloadMessage;
  }

  if (status === 400 || status === 422) {
    return 'Some input values are invalid. Please check and try again.';
  }
  if (status === 401) {
    return 'Your session has expired. Please login again.';
  }
  if (status === 403) {
    return 'You do not have permission to perform this action.';
  }
  if (status === 404) {
    return 'Requested resource was not found.';
  }
  if (status === 409) {
    return 'This action conflicts with current data. Please refresh and try again.';
  }
  if (status === 429) {
    return 'Too many requests. Please wait and retry.';
  }
  if (status >= 500) {
    return 'Server is temporarily unavailable. Please try again shortly.';
  }

  return 'Request failed. Please try again.';
};

const buildRequestError = ({
  message,
  status,
  code,
  isNetwork,
  canRetry,
  retry,
  cause
}) => {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  error.isNetworkError = Boolean(isNetwork);
  error.canRetry = Boolean(canRetry);
  error.retry = retry;
  if (cause) {
    error.cause = cause;
  }
  return error;
};

export const apiRequest = async (path, options = {}) => {
  beginApiRequest();

  try {
  const {
    method = 'GET',
    body,
    token,
    headers = {},
    timeoutMs = 15000,
    retryCount = 1,
    retryDelayMs = 700
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
    throw new Error('Missing API URL. Set EXPO_PUBLIC_API_URL or use default Render backend.');
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

  const totalAttempts = Math.max(1, Number(retryCount) + 1);

  for (let attempt = 1; attempt <= totalAttempts; attempt += 1) {
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
          ok: response.ok,
          attempt
        });
      }

      const payload = await response.json().catch(() => ({
        success: false,
        message: 'Invalid server response',
        data: null
      }));

      const hasAppFailure = payload?.success === false;
      const hasHttpFailure = !response.ok;

      if (!hasHttpFailure && !hasAppFailure) {
        setApiOffline(false);
        clearTimeout(timeoutId);
        return payload;
      }

      const friendlyMessage = buildFriendlyStatusMessage(response.status, payload?.message);
      const retryableStatus = response.status >= 500 || response.status === 429;
      const canRetryNow = retryableStatus && attempt < totalAttempts;

      if (canRetryNow) {
        await wait(retryDelayMs * attempt);
        clearTimeout(timeoutId);
        continue;
      }

      clearTimeout(timeoutId);
      throw buildRequestError({
        message: friendlyMessage,
        status: response.status,
        code: response.status,
        isNetwork: false,
        canRetry: retryableStatus,
        retry: () =>
          apiRequest(path, {
            ...options,
            retryCount: Math.max(0, Number(retryCount)),
            retryDelayMs
          })
      });
    } catch (error) {
      clearTimeout(timeoutId);

      if (error?.canRetry !== undefined || error?.status) {
        throw error;
      }

      if (__DEV__) {
        console.log('[API][ERR]', {
          method,
          url,
          message: error?.message,
          attempt
        });
      }

      const timedOut = error?.name === 'AbortError';
      const networkError = timedOut || isLikelyNetworkError(error);
      const canRetryNow = networkError && attempt < totalAttempts;

      if (canRetryNow) {
        await wait(retryDelayMs * attempt);
        continue;
      }

      const friendlyMessage = timedOut
        ? 'Request timed out. Please check your connection and retry.'
        : networkError
          ? 'Unable to reach the server. Please check your internet connection and retry.'
          : error?.message || 'Unexpected request error. Please try again.';

      if (networkError) {
        setApiOffline(true);
      }

      throw buildRequestError({
        message: friendlyMessage,
        code: timedOut ? 'TIMEOUT' : networkError ? 'NETWORK' : 'UNKNOWN',
        isNetwork: networkError,
        canRetry: true,
        retry: () =>
          apiRequest(path, {
            ...options,
            retryCount: Math.max(0, Number(retryCount)),
            retryDelayMs
          }),
        cause: error
      });
    }
  }

  throw buildRequestError({
    message: 'Request failed after retries. Please try again.',
    code: 'RETRY_EXHAUSTED',
    isNetwork: false,
    canRetry: true,
    retry: () => apiRequest(path, options)
  });
  } finally {
    endApiRequest();
  }
};

export const apiBaseUrl = API_BASE_URL;
export { API_URL };
export { isLikelyNetworkError as isNetworkError };
