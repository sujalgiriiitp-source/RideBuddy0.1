import React from 'react';
import { Stack } from 'expo-router';
import SubscriptionScreen from '../../src/screens/SubscriptionScreen';

export default function Subscription() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Subscription Plans',
          headerShown: true,
          headerBackTitle: 'Back'
        }}
      />
      <SubscriptionScreen />
    </>
  );
}
