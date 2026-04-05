import React, { useMemo } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import ChatScreen from '../../src/screens/ChatScreen';
import ConversationListScreen from '../../src/screens/ConversationListScreen';
import { createLegacyNavigation } from '../../src/utils/routerNavigation';

const normalize = (value, fallback = '') => {
  if (Array.isArray(value)) {
    return value[0] || fallback;
  }
  return value || fallback;
};

export default function ChatRoute() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const navigation = useMemo(() => createLegacyNavigation(router), [router]);

  const conversationId = normalize(params.conversationId);
  const rideId = normalize(params.rideId);
  const rideName = normalize(params.rideName, 'Conversation');

  if (!conversationId) {
    return <ConversationListScreen navigation={navigation} />;
  }

  const route = {
    params: {
      conversationId,
      rideId,
      rideName
    }
  };

  return <ChatScreen route={route} navigation={navigation} />;
}
