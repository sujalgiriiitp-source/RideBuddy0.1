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
      const storedToken = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
      const storedUser = await AsyncStorage.getItem(USER_STORAGE_KEY);
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
      setIsInitializing(false);
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
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: { email, password }
    });
    const payload = response.data;
    await saveAuthState(payload);
    return payload;
  };

  const signup = async (formData) => {
    const response = await apiRequest('/auth/signup', {
      method: 'POST',
      body: formData
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

  const refreshProfile = async () => {
    const activeToken = token || (await AsyncStorage.getItem(TOKEN_STORAGE_KEY));
    if (!activeToken) {
      return null;
    }

    const response = await apiRequest('/users/profile', {
      token: activeToken
    });
    const nextUser = response.data;
    setUser(nextUser);
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
      refreshProfile
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
