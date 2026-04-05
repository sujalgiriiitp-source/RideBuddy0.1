import React from 'react';
import { Redirect } from 'expo-router';
import SignupScreen from '../src/screens/SignupScreen';
import { useAuth } from '../src/context/AuthContext';

export default function SignupRoute() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/home" />;
  }

  return <SignupScreen />;
}
