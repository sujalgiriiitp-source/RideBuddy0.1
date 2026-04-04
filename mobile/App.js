import React from 'react';
import { ActivityIndicator, SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';
import Toast from 'react-native-toast-message';
import RootNavigator from './src/navigation/RootNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider } from './src/context/ThemeContext';
import { NotificationProvider } from './src/context/NotificationContext';
import { ChatProvider } from './src/context/ChatContext';

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || 'Unknown app error' };
  }

  componentDidCatch(error) {
    console.error('RideBuddy App crash:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={styles.safeArea}>
          <StatusBar barStyle="dark-content" />
          <View style={styles.container}>
            <Text style={styles.title}>RideBuddy</Text>
            <Text style={styles.subtitle}>App failed to render.</Text>
            <Text style={styles.meta}>{this.state.message}</Text>
          </View>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

function StableHome() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.subtitle}>Loading RideBuddy...</Text>
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  const navigationRef = React.useRef(null);

  return (
    <AppErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <ChatProvider>
            <NotificationProvider navigation={navigationRef.current}>
              <RootNavigator ref={navigationRef} />
            </NotificationProvider>
          </ChatProvider>
        </AuthProvider>
      </ThemeProvider>
      <Toast />
    </AppErrorBoundary>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FB'
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },
  subtitle: {
    fontSize: 16,
    marginTop: 12,
    color: '#1E293B',
    textAlign: 'center'
  },
  meta: {
    fontSize: 14,
    marginTop: 8,
    color: '#64748B',
    textAlign: 'center'
  }
});
