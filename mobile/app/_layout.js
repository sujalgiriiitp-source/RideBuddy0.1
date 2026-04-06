import React, { useMemo } from 'react';
import { Head, Stack, useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { AuthProvider } from '../src/context/AuthContext';
import { ChatProvider } from '../src/context/ChatContext';
import { NotificationProvider } from '../src/context/NotificationContext';
import { ThemeProvider } from '../src/context/ThemeContext';
import { createLegacyNavigation } from '../src/utils/routerNavigation';
import PwaRegistrar from '../src/components/PwaRegistrar';

export default function RootLayout() {
  const router = useRouter();
  const legacyNavigation = useMemo(() => createLegacyNavigation(router), [router]);

  return (
    <AuthProvider>
      <ChatProvider>
        <NotificationProvider navigation={legacyNavigation}>
          <ThemeProvider>
            <Head>
              <title>RideBuddy</title>
              <meta name="theme-color" content="#1a56db" />
              <meta name="apple-mobile-web-app-capable" content="yes" />
              <meta name="apple-mobile-web-app-status-bar-style" content="default" />
              <meta name="apple-mobile-web-app-title" content="RideBuddy" />
              <link rel="manifest" href="/manifest.json" />
              <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
            </Head>
            <PwaRegistrar />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="login" />
              <Stack.Screen name="signup" />
              <Stack.Screen name="verify-email" />
              <Stack.Screen name="forgot-password" />
              <Stack.Screen name="reset-password" />
              <Stack.Screen name="privacy-policy" options={{ headerShown: true, title: 'Privacy Policy' }} />
              <Stack.Screen name="terms" options={{ headerShown: true, title: 'Terms of Service' }} />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="notifications" options={{ headerShown: true, title: 'Notifications' }} />
              <Stack.Screen name="ride/[rideId]" options={{ headerShown: true, title: 'Ride Details' }} />
              <Stack.Screen name="main" />
            </Stack>
            <Toast />
          </ThemeProvider>
        </NotificationProvider>
      </ChatProvider>
    </AuthProvider>
  );
}
