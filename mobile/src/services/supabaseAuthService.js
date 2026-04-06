import * as Linking from 'expo-linking';
import { getSupabaseClient } from '../config/supabase';

const isWrongCredentialMessage = (message) => {
  const normalized = String(message || '').toLowerCase();
  return (
    normalized.includes('invalid login credentials') ||
    normalized.includes('invalid_credentials') ||
    normalized.includes('email not confirmed') ||
    normalized.includes('invalid email or password')
  );
};

export const mapSupabaseAuthError = (error, fallback = 'Authentication failed. Please try again.') => {
  const message = String(error?.message || '').trim();

  if (!message) {
    return fallback;
  }

  if (isWrongCredentialMessage(message)) {
    return 'Incorrect email or password.';
  }

  if (message.toLowerCase().includes('email not confirmed')) {
    return 'Please verify your email before logging in.';
  }

  if (message.toLowerCase().includes('user already registered')) {
    return 'This email is already registered. Please login instead.';
  }

  return message;
};

const buildRedirectUrl = (path) => Linking.createURL(path);

export const signupWithEmailVerification = async ({ email, password, name, phone }) => {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: buildRedirectUrl('/login'),
      data: {
        name: name || '',
        phone: phone || ''
      }
    }
  });

  if (error) {
    throw new Error(mapSupabaseAuthError(error, 'Unable to create account right now.'));
  }

  return data;
};

export const signInWithEmailPassword = async ({ email, password }) => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    throw new Error(mapSupabaseAuthError(error, 'Unable to login.'));
  }

  return data;
};

export const signOutSupabase = async () => {
  const supabase = getSupabaseClient();
  await supabase.auth.signOut();
};

export const resendVerificationEmail = async (email) => {
  const supabase = getSupabaseClient();
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: {
      emailRedirectTo: buildRedirectUrl('/login')
    }
  });

  if (error) {
    throw new Error(mapSupabaseAuthError(error, 'Unable to resend verification email.'));
  }
};

export const requestPasswordReset = async (email) => {
  const supabase = getSupabaseClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: buildRedirectUrl('/reset-password')
  });

  if (error) {
    throw new Error(mapSupabaseAuthError(error, 'Unable to send reset email.'));
  }
};

const extractRecoveryTokens = (url) => {
  if (!url) {
    return null;
  }

  const hashIndex = url.indexOf('#');
  const queryFromHash = hashIndex >= 0 ? url.slice(hashIndex + 1) : '';
  const searchParams = new URLSearchParams(queryFromHash);

  const accessToken = searchParams.get('access_token');
  const refreshToken = searchParams.get('refresh_token');
  const type = searchParams.get('type');

  if (!accessToken || !refreshToken || type !== 'recovery') {
    return null;
  }

  return {
    access_token: accessToken,
    refresh_token: refreshToken
  };
};

export const restoreRecoverySessionFromUrl = async (url) => {
  const sessionTokens = extractRecoveryTokens(url);
  if (!sessionTokens) {
    return false;
  }

  const supabase = getSupabaseClient();
  const { error } = await supabase.auth.setSession(sessionTokens);

  if (error) {
    throw new Error(mapSupabaseAuthError(error, 'Reset link is invalid or expired.'));
  }

  return true;
};

export const updatePassword = async (password) => {
  const supabase = getSupabaseClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    throw new Error(mapSupabaseAuthError(error, 'Unable to set new password.'));
  }
};
