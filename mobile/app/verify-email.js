import React, { useMemo } from 'react';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import VerifyEmailScreen from '../src/screens/VerifyEmailScreen';
import { useAuth } from '../src/context/AuthContext';
import { createLegacyNavigation } from '../src/utils/routerNavigation';

export default function VerifyEmailRoute() {
  const { isAuthenticated } = useAuth();
  const { email } = useLocalSearchParams();
  const router = useRouter();
  const navigation = useMemo(() => createLegacyNavigation(router), [router]);

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/home" />;
  }

  const resolvedEmail = Array.isArray(email) ? email[0] : email;

  return <VerifyEmailScreen navigation={navigation} email={resolvedEmail || ''} />;
}
