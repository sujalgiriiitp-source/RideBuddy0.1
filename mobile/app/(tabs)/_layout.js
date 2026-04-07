import React from 'react';
import { Text, View } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/context/ThemeContext';
import { useChatContext } from '../../src/context/ChatContext';
import NotificationBadge from '../../src/components/NotificationBadge';

const getTabIconName = (routeName, focused) => {
  if (routeName === 'home') {
    return focused ? 'home' : 'home-outline';
  }
  if (routeName === 'create') {
    return focused ? 'add-circle' : 'add-circle-outline';
  }
  if (routeName === 'chat') {
    return focused ? 'chatbubbles' : 'chatbubbles-outline';
  }
  if (routeName === 'intent') {
    return focused ? 'compass' : 'compass-outline';
  }
  if (routeName === 'profile') {
    return focused ? 'person' : 'person-outline';
  }
  return focused ? 'ellipse' : 'ellipse-outline';
};

const getTabLabel = (routeName) => {
  if (routeName === 'home') return 'Home';
  if (routeName === 'create') return 'Create';
  if (routeName === 'chat') return 'Chat';
  if (routeName === 'intent') return 'Intent';
  if (routeName === 'profile') return 'Profile';
  return '';
};

export default function TabsLayout() {
  const { theme } = useTheme();
  const { unreadCount } = useChatContext();

  return (
    <Tabs
      initialRouteName="home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textTertiary,
        tabBarShowLabel: false,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          marginBottom: 4
        },
        tabBarStyle: {
          height: 72,
          paddingTop: 10,
          borderTopWidth: 1,
          borderTopColor: '#DDE5F5',
          backgroundColor: theme.card
        },
        tabBarIcon: ({ color, focused }) => (
          <View style={{ position: 'relative' }}>
            <View
              style={{
                transform: [{ scale: focused ? 1.08 : 1 }],
                borderRadius: 999,
                paddingHorizontal: focused ? 10 : 3,
                paddingVertical: focused ? 6 : 3,
                backgroundColor: focused ? 'rgba(26,86,219,0.14)' : 'transparent',
                flexDirection: 'row',
                alignItems: 'center',
                gap: focused ? 6 : 0
              }}
            >
              <Ionicons name={getTabIconName(route.name, focused)} size={22} color={color} />
              {focused ? (
                <Text style={{ color: theme.primary, fontSize: 11, fontWeight: '800' }}>
                  {getTabLabel(route.name)}
                </Text>
              ) : null}
            </View>
            {route.name === 'chat' && unreadCount > 0 && (
              <View style={{ position: 'absolute', top: -4, right: -4 }}>
                <NotificationBadge count={unreadCount} size="sm" />
              </View>
            )}
          </View>
        )
      })}
    >
      <Tabs.Screen name="home" options={{ title: 'Home' }} />
      <Tabs.Screen name="create" options={{ title: 'Create Ride' }} />
      <Tabs.Screen name="chat" options={{ title: 'Chat' }} />
      <Tabs.Screen name="intent" options={{ title: 'Intent' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
