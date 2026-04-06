import React, { useMemo } from 'react';
import { useLocalSearchParams } from 'expo-router';
import ProfileScreen from '../../src/screens/ProfileScreen';

export default function ProfileRoute() {
  const params = useLocalSearchParams();
  const route = useMemo(
    () => ({
      params: {
        tab: Array.isArray(params.tab) ? params.tab[0] : params.tab
      }
    }),
    [params.tab]
  );

  return <ProfileScreen route={route} />;
}
