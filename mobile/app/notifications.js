import React, { useMemo } from 'react';
import { useRouter } from 'expo-router';
import NotificationsScreen from '../src/screens/NotificationsScreen';
import { createLegacyNavigation } from '../src/utils/routerNavigation';

export default function NotificationsRoute() {
  const router = useRouter();
  const navigation = useMemo(() => createLegacyNavigation(router), [router]);

  return <NotificationsScreen navigation={navigation} />;
}
