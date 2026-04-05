import React, { useMemo } from 'react';
import { useRouter } from 'expo-router';
import HomeScreen from '../../src/screens/HomeScreen';
import { createLegacyNavigation } from '../../src/utils/routerNavigation';

export default function HomeRoute() {
  const router = useRouter();
  const navigation = useMemo(() => createLegacyNavigation(router), [router]);

  return <HomeScreen navigation={navigation} />;
}
