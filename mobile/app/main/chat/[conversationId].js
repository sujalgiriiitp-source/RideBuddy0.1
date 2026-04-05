import React, { useMemo } from 'react';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import ChatScreen from '../../../src/screens/ChatScreen';
import { createLegacyNavigation } from '../../../src/utils/routerNavigation';

const normalize = (value, fallback = '') => {
  if (Array.isArray(value)) {
    return value[0] || fallback;
  }
  return value || fallback;
};

export default function ChatDetailsRoute() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const navigation = useMemo(() => createLegacyNavigation(router), [router]);

  const conversationId = normalize(params.conversationId);
  const rideId = normalize(params.rideId);
  const rideName = normalize(params.rideName, 'Conversation');

  const route = useMemo(
    () => ({
      params: {
        conversationId,
        rideId,
        rideName
      }
    }),
    [conversationId, rideId, rideName]
  );

  return (
    <>
      <Stack.Screen options={{ title: rideName || 'Chat' }} />
      <ChatScreen route={route} navigation={navigation} />
    </>
  );
}
