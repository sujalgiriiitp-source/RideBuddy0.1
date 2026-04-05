import React, { useMemo } from 'react';
import { Redirect, useRouter } from 'expo-router';
import LoginScreen from '../src/screens/LoginScreen';
import { useAuth } from '../src/context/AuthContext';
import { createLegacyNavigation } from '../src/utils/routerNavigation';

export default function LoginRoute() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const navigation = useMemo(() => createLegacyNavigation(router), [router]);

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/home" />;
  }

  return <LoginScreen navigation={navigation} />;
}
