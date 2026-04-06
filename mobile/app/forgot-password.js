import React, { useMemo } from 'react';
import { Redirect, useRouter } from 'expo-router';
import ForgotPasswordScreen from '../src/screens/ForgotPasswordScreen';
import { useAuth } from '../src/context/AuthContext';
import { createLegacyNavigation } from '../src/utils/routerNavigation';

export default function ForgotPasswordRoute() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const navigation = useMemo(() => createLegacyNavigation(router), [router]);

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/home" />;
  }

  return <ForgotPasswordScreen navigation={navigation} />;
}
