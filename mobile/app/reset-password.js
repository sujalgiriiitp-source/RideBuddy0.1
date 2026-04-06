import React, { useMemo } from 'react';
import { Redirect, useRouter } from 'expo-router';
import ResetPasswordScreen from '../src/screens/ResetPasswordScreen';
import { useAuth } from '../src/context/AuthContext';
import { createLegacyNavigation } from '../src/utils/routerNavigation';

export default function ResetPasswordRoute() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const navigation = useMemo(() => createLegacyNavigation(router), [router]);

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/home" />;
  }

  return <ResetPasswordScreen navigation={navigation} />;
}
