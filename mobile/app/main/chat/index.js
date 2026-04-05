import React, { useMemo } from 'react';
import { useRouter } from 'expo-router';
import ConversationListScreen from '../../../src/screens/ConversationListScreen';
import { createLegacyNavigation } from '../../../src/utils/routerNavigation';

export default function ChatListRoute() {
  const router = useRouter();
  const navigation = useMemo(() => createLegacyNavigation(router), [router]);

  return <ConversationListScreen navigation={navigation} />;
}
