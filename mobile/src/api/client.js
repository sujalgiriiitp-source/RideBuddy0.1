import axios from 'axios';
import Toast from 'react-native-toast-message';
import { API_BASE_URL } from '../config';

const baseURL = API_BASE_URL;

let tokenGetter = null;

export const setTokenGetter = (getter) => {
  tokenGetter = getter;
};

const api = axios.create({
  baseURL,
  timeout: 12000
});

api.interceptors.request.use(
  async (config) => {
    if (!API_BASE_URL) {
      throw new Error('Missing API URL. Set EXPO_PUBLIC_API_URL or use default Render backend.');
    }

    if (tokenGetter) {
      const token = await tokenGetter();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error?.response?.data?.message ||
      (error.code === 'ECONNABORTED'
        ? 'Request timeout. Please try again.'
        : `Unable to reach backend at ${API_BASE_URL}.`);

    Toast.show({
      type: 'error',
      text1: 'Request Failed',
      text2: message
    });

    return Promise.reject(error);
  }
);

export default api;
