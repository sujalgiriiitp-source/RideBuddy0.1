import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext';

export default function IndexRoute() {
  const { isInitializing, isAuthenticated } = useAuth();
  const { theme } = useTheme();

  if (isInitializing) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}> 
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return <Redirect href={isAuthenticated ? '/(tabs)/home' : '/login'} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
