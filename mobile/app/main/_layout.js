import React from 'react';
import { Stack } from 'expo-router';

export default function MainLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="home" />
      <Stack.Screen name="create-ride" />
      <Stack.Screen name="intent" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="chat/index" />
      <Stack.Screen name="chat/[conversationId]" options={{ headerShown: true, title: 'Chat' }} />
      <Stack.Screen name="ride/[rideId]" options={{ headerShown: true, title: 'Ride Details' }} />
    </Stack>
  );
}
