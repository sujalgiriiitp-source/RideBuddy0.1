import React from 'react';
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" options={{ headerShown: true, title: 'Login' }} />
      <Stack.Screen name="signup" options={{ headerShown: true, title: 'Signup' }} />
      <Stack.Screen name="main/home" options={{ headerShown: false }} />
    </Stack>
  );
}
