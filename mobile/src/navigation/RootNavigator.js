import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import HomeScreen from '../screens/HomeScreen';
import CreateRideScreen from '../screens/CreateRideScreen';
import RideDetailsScreen from '../screens/RideDetailsScreen';
import IntentScreen from '../screens/IntentScreen';
import ProfileScreen from '../screens/ProfileScreen';
import tokens from '../theme/tokens';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const getTabIconName = (routeName, focused) => {
  if (routeName === 'Home') {
    return focused ? 'home' : 'home-outline';
  }
  if (routeName === 'Create Ride') {
    return focused ? 'add-circle' : 'add-circle-outline';
  }
  if (routeName === 'Intent') {
    return focused ? 'compass' : 'compass-outline';
  }
  if (routeName === 'Profile') {
    return focused ? 'person' : 'person-outline';
  }
  return focused ? 'ellipse' : 'ellipse-outline';
};

const MainTabs = () => {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textTertiary,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          marginBottom: 4
        },
        tabBarStyle: {
          height: 66,
          paddingTop: 8,
          borderTopWidth: 1,
          borderTopColor: theme.border,
          backgroundColor: theme.card
        },
        tabBarIcon: ({ color, focused }) => (
          <View
            style={{
              transform: [{ scale: focused ? 1.08 : 1 }],
              borderRadius: tokens.radius.full,
              padding: 3
            }}
          >
            <Ionicons name={getTabIconName(route.name, focused)} size={22} color={color} />
          </View>
        )
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Create Ride" component={CreateRideScreen} />
      <Tab.Screen name="Intent" component={IntentScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const AppStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
      <Stack.Screen name="Ride Details" component={RideDetailsScreen} />
    </Stack.Navigator>
  );
};

const AuthStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
    </Stack.Navigator>
  );
};

const RootNavigator = () => {
  const { isAuthenticated, isInitializing } = useAuth();

  if (isInitializing) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return isAuthenticated ? <AppStack /> : <AuthStack />;
};

export default RootNavigator;
