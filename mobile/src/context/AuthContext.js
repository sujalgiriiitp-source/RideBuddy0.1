import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRequest } from '../api';
import {
  requestPasswordReset,
  resendVerificationEmail,
  signInWithEmailPassword,
  signOutSupabase,
  signupWithEmailVerification
} from '../services/supabaseAuthService';

const AuthContext = createContext(null);
const TOKEN_STORAGE_KEY = 'token';
const USER_STORAGE_KEY = 'user';

const isLikelyInvalidCredentialError = (error) => {
  const message = String(error?.message || '').toLowerCase();
  return (
    message.includes('invalid') ||
    message.includes('credential') ||
    message.includes('password') ||
    message.includes('user')
  );
};

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
    const authPayload = await signInWithEmailPassword({ email: normalizedEmail, password });
    const emailVerified = Boolean(authPayload?.user?.email_confirmed_at);

    if (!emailVerified) {
      await signOutSupabase();
      const verifyError = new Error('Please verify your email before logging in.');
      verifyError.code = 'EMAIL_NOT_VERIFIED';
      verifyError.email = normalizedEmail;
      throw verifyError;
    }

    let response;
    try {
      response = await apiRequest('/auth/login', {
        method: 'POST',
        body: { email: normalizedEmail, password }
      });
    } catch (loginError) {
      if (isLikelyInvalidCredentialError(loginError)) {
        const metadata = authPayload?.user?.user_metadata || {};
        const fallbackName = String(metadata?.name || normalizedEmail.split('@')[0] || 'RideBuddy User').trim();
        const fallbackPhone = String(metadata?.phone || '').trim();

        try {
          await apiRequest('/auth/signup', {
            method: 'POST',
            body: {
              name: fallbackName,
              email: normalizedEmail,
              password,
              phone: fallbackPhone
            }
          });

          response = await apiRequest('/auth/login', {
            method: 'POST',
            body: { email: normalizedEmail, password }
          });
        } catch (provisionError) {
          throw loginError;
        }
      } else {
        throw loginError;
      }
    }

    const payload = response.data;
    await saveAuthState(payload);
    return payload;
  };

  const signup = async (formData) => {
    const normalizedPayload = {
      name: String(formData?.name || '').trim(),
      email: String(formData?.email || '').trim().toLowerCase(),
      password: formData?.password || '',
      phone: String(formData?.phone || '').trim()
    };

    await signupWithEmailVerification(normalizedPayload);
    await signOutSupabase();

    return {
      requiresEmailVerification: true,
      email: normalizedPayload.email
    };
  };

  const logout = async () => {
    setToken(null);
    setUser(null);
    await signOutSupabase();
    await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
    await AsyncStorage.removeItem(USER_STORAGE_KEY);
  };

  const resendVerification = async (email) => {
    const normalizedEmail = String(email || '').trim().toLowerCase();
    if (!normalizedEmail) {
      throw new Error('Email is required to resend verification link.');
    }

    await resendVerificationEmail(normalizedEmail);
  };

  const forgotPassword = async (email) => {
    const normalizedEmail = String(email || '').trim().toLowerCase();
    if (!normalizedEmail) {
      throw new Error('Email is required to reset password.');
    }

    await requestPasswordReset(normalizedEmail);
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
      refreshProfile,
      resendVerification,
      forgotPassword
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
