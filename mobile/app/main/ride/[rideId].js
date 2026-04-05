import React, { useMemo } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import RideDetailsScreen from '../../../src/screens/RideDetailsScreen';
import { createLegacyNavigation } from '../../../src/utils/routerNavigation';

const normalize = (value) => {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
};

export default function RideDetailsRoute() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const navigation = useMemo(() => createLegacyNavigation(router), [router]);
  const rideId = normalize(params.rideId);

  const route = useMemo(
    () => ({
      params: {
        rideId
      }
    }),
    [rideId]
  );

  return <RideDetailsScreen route={route} navigation={navigation} />;
}
