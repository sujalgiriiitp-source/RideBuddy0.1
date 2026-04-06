import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRequest } from '../api';

const AuthContext = createContext(null);
const TOKEN_STORAGE_KEY = 'token';
const USER_STORAGE_KEY = 'user';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      console.log('[AuthContext] bootstrap start');
      const storedToken = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
      const storedUser = await AsyncStorage.getItem(USER_STORAGE_KEY);
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        console.log('[AuthContext] restored persisted session');
      }
      setIsInitializing(false);
      console.log('[AuthContext] bootstrap complete');
    };

    bootstrap();
  }, []);

  const saveAuthState = async (payload) => {
    setToken(payload.token);
    setUser(payload.user);
    await AsyncStorage.setItem(TOKEN_STORAGE_KEY, payload.token);
    await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(payload.user));
  };

  const login = async (email, password) => {
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: { email: normalizedEmail, password }
    });
    const payload = response.data;
    await saveAuthState(payload);
    return payload;
  };

  const signup = async (formData) => {
    const normalizedPayload = {
      ...formData,
      name: String(formData?.name || '').trim(),
      email: String(formData?.email || '').trim().toLowerCase(),
      phone: String(formData?.phone || '').trim()
    };

    const response = await apiRequest('/auth/signup', {
      method: 'POST',
      body: normalizedPayload
    });
    const payload = response.data;
    await saveAuthState(payload);
    return payload;
  };

  const logout = async () => {
    setToken(null);
    setUser(null);
    await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
    await AsyncStorage.removeItem(USER_STORAGE_KEY);
  };

  const resendVerification = async (email) => {
    const normalizedEmail = String(email || '').trim().toLowerCase();
    if (!normalizedEmail) {
      throw new Error('Email is required to resend verification link.');
    }

    try {
      await apiRequest('/auth/resend-verification', {
        method: 'POST',
        body: { email: normalizedEmail }
      });
    } catch (error) {
      if (error?.status === 404) {
        throw new Error('Email verification endpoint is not enabled on backend yet.');
      }
      throw error;
    }
  };

  const forgotPassword = async (email) => {
    const normalizedEmail = String(email || '').trim().toLowerCase();
    if (!normalizedEmail) {
      throw new Error('Email is required to reset password.');
    }

    try {
      await apiRequest('/auth/forgot-password', {
        method: 'POST',
        body: { email: normalizedEmail }
      });
    } catch (error) {
      if (error?.status === 404) {
        throw new Error('Forgot password endpoint is not enabled on backend yet.');
      }
      throw error;
    }
  };

  const resetPassword = async ({ token: resetToken, password }) => {
    const normalizedToken = String(resetToken || '').trim();

    if (!normalizedToken) {
      throw new Error('Reset token is missing. Please open the reset link again.');
    }

    if (!password || String(password).length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }

    try {
      await apiRequest('/auth/reset-password', {
        method: 'POST',
        body: {
          token: normalizedToken,
          password
        }
      });
    } catch (error) {
      if (error?.status === 404) {
        throw new Error('Reset password endpoint is not enabled on backend yet.');
      }
      throw error;
    }
  };

  const refreshProfile = async () => {
    const activeToken = token || (await AsyncStorage.getItem(TOKEN_STORAGE_KEY));
    if (!activeToken) {
      return null;
    }

    const response = await apiRequest('/users/profile', {
      token: activeToken
    });
    const nextUser = response.data;
    if (JSON.stringify(nextUser) !== JSON.stringify(user)) {
      setUser(nextUser);
    }
    await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
    return nextUser;
  };

  const value = useMemo(
    () => ({
      user,
      token,
      isInitializing,
      isAuthenticated: Boolean(token),
      login,
      signup,
      logout,
      refreshProfile,
      resendVerification,
      forgotPassword,
      resetPassword
    }),
    [user, token, isInitializing]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
