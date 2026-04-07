import React, { useMemo } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
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
  const isDesktopWeb = Platform.OS === 'web';

  if (isDesktopWeb) {
    if (!conversationId) {
      return (
        <View style={styles.desktopWrap}>
          <View style={styles.sidebar}><ConversationListScreen navigation={navigation} /></View>
          <View style={styles.emptyPane}>
            <Text style={styles.emptyIcon}>💬</Text>
            <Text style={styles.emptyTitle}>Start a conversation</Text>
            <Text style={styles.emptySub}>Start a conversation by messaging a driver from ride details</Text>
          </View>
        </View>
      );
    }

    const route = {
      params: {
        conversationId,
        rideId,
        rideName
      }
    };

    return (
      <View style={styles.desktopWrap}>
        <View style={styles.sidebar}><ConversationListScreen navigation={navigation} /></View>
        <View style={styles.chatPane}><ChatScreen route={route} navigation={navigation} /></View>
      </View>
    );
  }

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

const styles = StyleSheet.create({
  desktopWrap: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f8fafc'
  },
  sidebar: {
    width: 360,
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
    backgroundColor: '#FFFFFF'
  },
  chatPane: {
    flex: 1
  },
  emptyPane: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30
  },
  emptyIcon: {
    fontSize: 46,
    marginBottom: 8
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6
  },
  emptySub: {
    color: '#6b7280',
    textAlign: 'center',
    maxWidth: 360
  }
});
