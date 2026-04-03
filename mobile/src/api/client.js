import axios from 'axios';
import Toast from 'react-native-toast-message';
import { API_BASE_URL } from '../config/apiConfig';

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
      (error.code === 'ECONNABORTED' ? 'Request timeout. Please try again.' : 'Network error. Please check your internet.');

    Toast.show({
      type: 'error',
      text1: 'Request Failed',
      text2: message
    });

    return Promise.reject(error);
  }
);

export default api;
